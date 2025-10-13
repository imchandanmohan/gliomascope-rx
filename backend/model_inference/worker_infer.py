import sys, json, numpy as np, os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["KERAS_BACKEND"] = "tensorflow"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

from keras.models import load_model

def run_inference(model_path: str, arr: np.ndarray) -> np.ndarray:
    model = load_model(model_path, compile=False)
    y = model.predict(arr, verbose=0)[0] # type: ignore[reportOptionalMemberAccess,arg-type]
    return y.argmax(axis=-1).astype(np.uint8)

if __name__ == "__main__":
    # launched as: python worker_infer.py <model_path> <npz_path>
    model_path, npz_path = sys.argv[1], sys.argv[2]
    arr = np.load(npz_path)["arr"]
    mask = run_inference(model_path, arr)
    out_path = npz_path.replace(".npz", "_mask.npy")
    np.save(out_path, mask)
    print(out_path)