import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from app.database.session import engine
from app.database.base import Base
import app.models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tc_intel.init_db")

def init_db():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully!")

if __name__ == "__main__":
    init_db()
