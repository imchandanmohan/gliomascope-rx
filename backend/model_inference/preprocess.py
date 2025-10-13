from pathlib import Path
import os
import nibabel as nib
import numpy as np
import cv2
from backend.config import IMG_SIZE, ALLOWED_IMG_EXT, ALLOWED_NII_EXT
from backend.utils.logger import get_logger

log = get_logger("Preprocess")

def enhance_mri_image(img_u8: np.ndarray) -> np.ndarray:
    # jpeg-safe enhancement (denoise + CLAHE + gamma + normalize 0-1)
    den = cv2.fastNlMeansDenoising(img_u8, None, 10, 7, 21)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    eq = clahe.apply(den)
    gam = np.power(eq / 255.0, 0.9)
    out = (gam - gam.min()) / (gam.max() - gam.min() + 1e-8)
    return out.astype(np.float32)

def normalize_slice(img: np.ndarray) -> np.ndarray:
    img = img.astype(np.float32)
    lo, hi = np.percentile(img, 1), np.percentile(img, 99)
    img = np.clip(img, lo, hi)
    img = (img - img.min()) / (img.max() - img.min() + 1e-8)
    img = np.power(img, 0.8)  # slight gamma to match training look
    return img

def load_file_as_slices(path: str) -> tuple[list[np.ndarray], str]:
    """returns (list_of_normalized_slices, file_type) where file_type in {'nii','jpg'}"""
    p = Path(path)
    ext = p.suffix.lower()
    if ext in ALLOWED_NII_EXT or any(str(p).endswith(e) for e in ALLOWED_NII_EXT):
        vol = nib.load(str(p)).get_fdata()
        z = vol.shape[2]
        slices = []
        for i in range(z):
            sl = vol[:, :, i]
            sl = cv2.resize(sl, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
            sl = normalize_slice(sl)
            slices.append(sl)
        log.info(f"loaded NIfTI volume: {p.name} with {len(slices)} slices")
        return slices, "nii"
    elif ext in ALLOWED_IMG_EXT:
        img = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img is None: raise ValueError("could not read image")
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
        img = enhance_mri_image(img)  # make jpeg look closer to MRI
        log.info(f"loaded JPEG/PNG: {p.name}")
        return [img], "jpg"
    else:
        raise ValueError(f"unsupported file type: {ext}")