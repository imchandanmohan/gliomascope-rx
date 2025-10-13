import sys
from loguru import logger

LOG_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<cyan>{name}</cyan> | "
    "<level>{level}</level> | "
    "{message}"
)

def get_logger(name: str):
    log = logger.bind()
    log.remove()
    log.add(sys.stdout, colorize=True, format=LOG_FORMAT)
    return log.bind(module=name)