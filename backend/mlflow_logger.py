import mlflow
from backend.config import MLFLOW_TRACKING_URI, MLFLOW_EXPERIMENT
from backend.utils.logger import get_logger

log = get_logger("MLflow")

def log_to_mlflow(model_name: str, file_type: str, latency_sec: float, success: bool = True, extra: dict | None = None):
    try:
        mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
        mlflow.set_experiment(MLFLOW_EXPERIMENT)
        with mlflow.start_run(run_name="inference"):
            mlflow.log_param("model_name", model_name)
            mlflow.log_param("file_type", file_type)
            mlflow.log_metric("latency_sec", latency_sec)
            mlflow.log_metric("success", int(success))
            if extra:
                for k, v in extra.items():
                    if isinstance(v, (int, float)):
                        mlflow.log_metric(k, v)
                    else:
                        mlflow.log_param(k, str(v))
        log.info(f"mlflow logged: model={model_name} type={file_type} latency={latency_sec:.3f}s success={success}")
    except Exception as e:
        log.exception(f"mlflow logging failed: {e}")