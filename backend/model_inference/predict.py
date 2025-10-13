import io
import os
import base64
import numpy as np
import onnxruntime as ort
import cv2
from PIL import Image
import nibabel as nib
from loguru import logger
from backend.config import MODEL_PATH

_session = None


def get_session() -> ort.InferenceSession:
    """Load ONNX model once and reuse."""
    global _session
    if _session is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        logger.info(f"🔹 Loading ONNX model from {MODEL_PATH}")
        _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
        logger.info("✅ ONNX model ready")
    return _session


def _preprocess_image(img: np.ndarray) -> np.ndarray:
    img = img.astype(np.float32)
    img = (img - img.min()) / (img.max() + 1e-8)
    img_resized = cv2.resize(img, (128, 128))
    img_input = np.stack([img_resized, img_resized], axis=-1)[None, ...]
    return img_input


def _predict_mask(session, img_input: np.ndarray) -> np.ndarray:
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: img_input})
    pred = outputs[0][0]
    mask = np.argmax(pred, axis=-1).astype(np.uint8)
    return mask


def _overlay_mask(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    overlay = cv2.applyColorMap((mask * 60).astype(np.uint8), cv2.COLORMAP_JET)
    base = cv2.cvtColor((img * 255).astype(np.uint8), cv2.COLOR_GRAY2BGR)
    return cv2.addWeighted(base, 0.6, overlay, 0.4, 0)


def _to_b64(image: np.ndarray) -> str:
    _, buf = cv2.imencode(".png", image)
    return base64.b64encode(buf).decode("utf-8")


def predict_from_file(file_bytes: bytes, filename: str) -> dict:
    """Return multiple segmentation views as base64 images."""
    session = get_session()
    ext = os.path.splitext(filename)[-1].lower()

    if ext in [".jpg", ".jpeg", ".png"]:
        img = Image.open(io.BytesIO(file_bytes)).convert("L")
        img = np.array(img, dtype=np.float32)
    elif ext in [".nii", ".nii.gz"]:
        nii = nib.load(io.BytesIO(file_bytes))
        data = nii.get_fdata()
        mid = data.shape[2] // 2
        img = data[:, :, mid].astype(np.float32)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # preprocess + predict
    img_input = _preprocess_image(img)
    mask = _predict_mask(session, img_input)
    overlay = _overlay_mask(cv2.resize(img, (128, 128)), mask)

    # pseudo ground truth (for now just invert mask for display)
    ground_truth = (255 - (mask * 80)).astype(np.uint8)

    # generate color-coded versions
    mask_color = cv2.applyColorMap((mask * 80).astype(np.uint8), cv2.COLORMAP_TURBO)

    # small intensity histogram
    hist = cv2.calcHist([img.astype(np.uint8)], [0], None, [256], [0, 256])
    hist_img = np.zeros((128, 256, 3), dtype=np.uint8)
    cv2.normalize(hist, hist, 0, 128, cv2.NORM_MINMAX)
    for x, h in enumerate(hist):
        cv2.line(hist_img, (x, 128), (x, 128 - int(h)), (0, 255, 255), 1)

    # metrics
    pixel_count = np.prod(mask.shape)
    tumor_pixels = int(np.sum(mask > 0))
    coverage = round(100 * tumor_pixels / pixel_count, 2)
    metrics = {
        "coverage_percent": coverage,
        "unique_classes": np.unique(mask).tolist(),
        "tumor_pixel_count": tumor_pixels,
    }

    # encode all images
    charts = {
        "input_gray": _to_b64(cv2.resize((img * 255).astype(np.uint8), (128, 128))),
        "predicted_mask": _to_b64(mask_color),
        "overlay": _to_b64(overlay),
        "ground_truth": _to_b64(ground_truth),
        "intensity_hist": _to_b64(hist_img),
    }

    return {"mask_shape": mask.shape, "metrics": metrics, "charts": charts}