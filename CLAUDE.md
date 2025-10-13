# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GliomaScope RX is an AI-powered radiology assistant for brain tumor analysis. It combines:
- **Backend**: FastAPI service with ONNX model inference for brain tumor segmentation
- **Frontend**: React + TypeScript + Vite with real-time image processing
- **ML Pipeline**: U-Net segmentation model trained on BraTS2020 dataset
- **LLM Integration**: Gemini 1.5 Pro for clinical analysis and assistance
- **MLOps**: MLflow tracking for inference monitoring

**IMPORTANT**: This is an educational/portfolio project and NOT intended for clinical use.

## Development Commands

### Backend (Python 3.12)

The backend uses `uv` as the package manager (configured in `pyproject.toml`).

```bash
# Navigate to backend
cd backend

# Install dependencies (if using uv)
uv pip install -e .

# Alternative: create venv and install with pip
python -m venv .venv
source .venv/bin/activate
pip install -e .

# Run development server (from backend directory)
./run.sh
# OR manually:
export PYTHONPATH=$(pwd)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Backend runs on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Frontend (React + Vite)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend runs on http://localhost:5173

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

### Docker

Note: The Dockerfile in `backend/` is outdated (references old structure). The project is currently set up for local development.

## Architecture

### Backend Structure

The backend follows a modular service architecture:

```
backend/
├── app.py                    # FastAPI application entry point
├── config.py                 # Global configuration (MODEL_PATH, IMG_SIZE, MLFLOW settings)
├── model_inference/          # Model inference pipeline
│   ├── predict.py           # Main prediction logic with ONNX runtime
│   ├── preprocess.py        # Image preprocessing (NIfTI/JPEG/PNG support)
│   ├── visualize.py         # Generate segmentation overlays
│   ├── pipeline.py          # Deprecated: older pipeline (not used by main app)
│   └── worker_infer.py      # Worker utilities
├── llm_service/
│   └── llm_client.py        # LLM integration (currently stub)
├── utils/
│   └── logger.py            # Centralized logging with loguru
├── mlflow_logger.py          # MLflow tracking for inference metrics
└── models/
    └── GliomaScopeRX_BraTS2020_final.onnx  # ONNX model (128x128 input)
```

**Key Backend Details:**

1. **Model Format**: Uses ONNX Runtime for inference (converted from Keras)
   - Model path: `backend/models/GliomaScopeRX_BraTS2020_final.onnx`
   - Input size: 128×128 pixels, 2 channels
   - Output: 4-class segmentation mask

2. **Image Processing Pipeline** (`backend/model_inference/predict.py:54`):
   - Supports NIfTI (.nii, .nii.gz), JPEG, PNG formats
   - Preprocessing includes normalization, resizing, and enhancement
   - Returns base64-encoded visualizations: input_gray, predicted_mask, overlay, ground_truth, intensity_hist

3. **API Endpoint**: `POST /predict` (backend/app.py:28)
   - Accepts file upload
   - Returns JSON with mask_shape, metrics, and charts (base64 images)

4. **MLflow Integration**: All predictions are logged to MLflow with latency metrics
   - Tracking URI: `http://localhost:5000` (default)
   - Experiment: "GliomaScopeRX_Inference"

### Frontend Structure

```
frontend/src/
├── App.tsx                   # Main app component with state management
├── components/
│   ├── Navbar.tsx           # Top navigation
│   ├── EnhancementConsole.tsx  # Left sidebar: image upload + enhancement controls
│   ├── ImagePanel.tsx       # Display panels for input/output images
│   ├── Gallery.tsx          # Bottom gallery for segmentation results
│   ├── LLMConsole.tsx       # Right sidebar: Gemini LLM chat interface
│   ├── FeatureGrid.tsx      # Feature showcase
│   ├── ParticleBackground.tsx
│   ├── ReportModal.tsx      # PDF report generation UI
│   └── AboutModal.tsx
├── hooks/
│   ├── useImageProcessor.ts # Web Worker for client-side image enhancement
│   └── useLLMAssistant.ts   # Gemini API integration for clinical analysis
└── types.ts                  # TypeScript interfaces
```

**Key Frontend Details:**

1. **Image Enhancement** (`frontend/src/hooks/useImageProcessor.ts`):
   - Runs in Web Worker for non-blocking UI
   - Supports brightness, contrast, gamma, sharpness adjustments
   - History-based undo/redo system

2. **LLM Integration** (`frontend/src/hooks/useLLMAssistant.ts`):
   - Direct Gemini 1.5 Pro API calls from browser
   - Sends both input image and segmentation mask for analysis
   - API key required (not implemented in backend)

3. **Prediction Flow** (`frontend/src/App.tsx:79`):
   - User uploads image → EnhancementConsole
   - Client-side enhancement applied via Web Worker
   - "Analyze" button → POST to `http://127.0.0.1:8000/predict`
   - Backend returns base64 images → displayed in Gallery

### Data Flow

```
User Upload → EnhancementConsole (Client-side processing)
           ↓
       ImagePanel (Input)
           ↓
    [Analyze Button] → POST /predict (FastAPI)
           ↓
    model_inference/predict.py (ONNX inference)
           ↓
    Returns: {mask_shape, metrics, charts{overlay, predicted_mask, ...}}
           ↓
    Gallery + ImagePanel (Output) + LLMConsole (optional analysis)
```

## Configuration Files

- **Backend Config**: `backend/config.py`
  - `MODEL_PATH`: Path to ONNX model
  - `IMG_SIZE`: 128 (fixed input size)
  - `N_CLASSES`: 4 (background + 3 tumor regions)
  - `MLFLOW_TRACKING_URI`, `MLFLOW_EXPERIMENT`

- **Frontend**:
  - Vite config: `frontend/vite.config.ts`
  - TypeScript: `frontend/tsconfig.json`, `frontend/tsconfig.app.json`
  - ESLint: `frontend/eslint.config.js`
  - Tailwind: `frontend/tailwind.config.js`

## MLOps Infrastructure

Located in `mlops/` directory:
- MLflow server setup
- Model artifacts and checkpoints (`.keras` and `.weights.h5` files)
- Training logs and exports
- Grafana configuration (for monitoring)

The production model is in `backend/models/` as ONNX format for faster inference.

## Important Notes

1. **CORS**: Backend allows all origins (`allow_origins=["*"]`) for development
2. **Temporary Files**: Backend stores uploads in `/tmp/` and charts in `/tmp/gsrx_charts`
3. **Model Loading**: ONNX session is cached globally after first load
4. **Image Formats**:
   - NIfTI files: extracts middle slice for 2D inference
   - JPEG/PNG: applies enhancement to mimic MRI appearance
5. **No Tests**: Project currently has no test suite
6. **Git Status**: Multiple deleted files in `backend/app/` (old structure) - new structure is flattened
7. **Hardcoded URL**: Frontend has hardcoded backend URL `http://127.0.0.1:8000/predict` (App.tsx:92)

## Development Workflow

1. Start backend: `cd backend && ./run.sh`
2. Start frontend: `cd frontend && npm run dev`
3. Upload image via UI → Apply enhancements → Click "Analyze"
4. View segmentation in Gallery
5. Optional: Use LLM Console with Gemini API key for clinical insights

## Python Package Structure

The backend uses setuptools with custom package discovery:
- Packages: `utils`, `llm_service`, `model_inference`
- Modules: `app`, `mlflow_logger`
- The `PYTHONPATH` must be set to backend directory root when running

## API Reference

**Endpoints:**
- `GET /health` - Health check
- `POST /predict` - Brain tumor segmentation
  - Input: `file` (multipart/form-data)
  - Output: JSON with `mask_shape`, `metrics`, `charts` (base64 images)

Note: The README mentions endpoints `/upload`, `/analyze`, `/chat`, `/research`, `/report` but these are not implemented in the current `app.py` - only `/health` and `/predict` exist.
