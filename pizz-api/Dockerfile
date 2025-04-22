FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY pizz-api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY pizz-api/ ./pizz-api/
WORKDIR /app/pizz-api

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

