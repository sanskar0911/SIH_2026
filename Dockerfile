# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend-app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend + Serve Built Frontend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY pytest.ini ./

# Copy compiled frontend dist into /app/frontend/dist for FastAPI static mounting
COPY --from=frontend-builder /frontend-app/dist ./frontend/dist

ENV MOCK_DATA_MODE=true
ENV MOSDAC_ENABLED=false
ENV LOG_LEVEL=INFO
ENV PYTHONPATH=backend
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
