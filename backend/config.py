from pathlib import Path
import os

# model
MODEL_PATH = Path(__file__).resolve().parent / "models" / "GliomaScopeRX_BraTS2020_final.onnx"
IMG_SIZE   = 128
N_CLASSES  = 4

# logging
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# mlflow
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MLFLOW_EXPERIMENT   = os.getenv("MLFLOW_EXPERIMENT", "GliomaScopeRX_Inference")

# runtime
ALLOWED_IMG_EXT = {".jpg", ".jpeg", ".png"}
ALLOWED_NII_EXT = {".nii", ".nii.gz"}

CHARTS_DIR = Path("/tmp/gsrx_charts")
CHARTS_DIR.mkdir(exist_ok=True)