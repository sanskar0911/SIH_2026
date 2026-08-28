import time
import logging
from app.services.analysis.orchestrator import orchestrator

logger = logging.getLogger("tc_intel.worker")

def start_worker():
    logger.info("Starting TC-INTEL Background Analysis Worker...")
    while True:
        try:
            logger.info("Worker heartbeat: monitoring background jobs...")
            time.sleep(30)
        except KeyboardInterrupt:
            logger.info("Worker stopping.")
            break

if __name__ == "__main__":
    start_worker()
