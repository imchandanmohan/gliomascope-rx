import time, os
from fastapi import UploadFile
from backend.model_inference.preprocess import load_file_as_slices
from backend.model_inference.predict import predict_slices
from backend.model_inference.visualize import generate_visualizations
from backend.mlflow_logger import log_to_mlflow
from backend.utils.logger import get_logger
from backend.config import CHARTS_DIR
from pathlib import Path

base_url = "http://127.0.0.1:8000/files"

log = get_logger("Pipeline")

async def process_prediction(file: UploadFile):
    t0 = time.time()

    # 1) save to temp
    raw = await file.read()
    tmp_path = f"/tmp/gsrx_{int(time.time()*1000)}_{file.filename}"
    with open(tmp_path, "wb") as f:
        f.write(raw)

    try:
        # 2) preprocess (handles nii & jpg)
        slices, ftype = load_file_as_slices(tmp_path)

        # 3) predict
        preds = predict_slices(slices)

        # 4) visuals
        charts = generate_visualizations(slices, preds)

        
        for k, v in charts.items():
            charts[k] = f"{base_url}/{Path(v).name}"
        # 5) metrics
        latency = round(time.time() - t0, 3)
        log.info(f"inference OK in {latency}s on {file.filename}")
        log_to_mlflow(model_name="GliomaScopeRX_BraTS2020", file_type=ftype, latency_sec=latency, success=True,
                      extra={"num_slices": len(slices)})

        return {
            "status": "success",
            "file_type": ftype,
            "latency_sec": latency,
            "num_slices": len(slices),
            "charts": charts
        }
    except Exception as e:
        log.exception(f"inference failed: {e}")
        latency = round(time.time() - t0, 3)
        log_to_mlflow(model_name="GliomaScopeRX_BraTS2020", file_type="unknown", latency_sec=latency, success=False)
        raise
    finally:
        try: os.remove(tmp_path)
        except: pass