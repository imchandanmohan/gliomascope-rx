import matplotlib.pyplot as plt
import numpy as np
import io, base64

def plot_to_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

def generate_charts(metrics):
    """
    metrics: dict containing {
        'image': np.ndarray,
        'mask': np.ndarray,
        'tumor_pixel_count': int,
        ...
    }
    """
    img = metrics.get("image")
    mask = metrics.get("mask")

    charts = {}

    # --- ✅ Overlay: tumor segmentation ---
    if img is not None and mask is not None:
        plt.figure(figsize=(4, 4))
        plt.imshow(img, cmap="gray")
        plt.imshow(mask, cmap="jet", alpha=0.4)  # transparent overlay
        plt.axis("off")
        charts["overlay"] = plot_to_base64()

    # --- Example additional charts ---
    if "intensity_hist" in metrics:
        plt.figure(figsize=(4, 3))
        plt.hist(img.ravel(), bins=50, color="teal", alpha=0.8)
        plt.title("Pixel Intensity Histogram")
        charts["intensity_hist"] = plot_to_base64()

    if "coverage_percent" in metrics:
        plt.figure(figsize=(4, 3))
        plt.bar(["Tumor Coverage"], [metrics["coverage_percent"]], color="orange")
        plt.ylim(0, 100)
        charts["coverage_percent"] = plot_to_base64()

    return charts