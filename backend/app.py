from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.model_inference.predict import predict_from_file
from backend.utils.logger import get_logger
import base64

log = get_logger("App")

app = FastAPI(title="GliomaScope RX Backend", version="2.1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "GliomaScope RX Backend"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Run ONNX segmentation on uploaded image (.nii or .jpg/.png).
    Returns all segmentation visualizations as base64.
    """
    try:
        # --- Step 1: Read uploaded file ---
        contents = await file.read()
        filename = file.filename
        log.info(f"🧠 Received file: {filename} ({len(contents)/1e6:.2f} MB)")

        # --- Step 2: Run inference ---
        result = predict_from_file(contents, filename)
        log.info("✅ Model inference complete.")

        # --- Step 3: Build clean JSON response ---
        charts = result.get("charts", {})
        response = {
            "mask_shape": result.get("mask_shape"),
            "metrics": result.get("metrics"),
            "charts": charts,  # includes overlay, input_gray, mask, etc.
        }

        log.info(f"📊 Returning {len(charts)} visualizations.")
        return JSONResponse(content=response)

    except Exception as e:
        log.exception(f"❌ Prediction failed: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)