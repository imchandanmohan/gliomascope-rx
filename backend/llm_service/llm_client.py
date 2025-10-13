from backend.utils.logger import get_logger

log = get_logger("LLM")

# replace with your provider (OpenAI/Gemini/etc.)
def ask_llm(prompt: str) -> str:
    # stub for now: echo
    log.info(f"LLM prompt len={len(prompt)}")
    #return f"[LLM stub] You asked: {prompt[:120]}..."
    return f" you type: {str}"