FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch

RUN pip install --no-cache-dir \
    -r email_emotion_worker/requirements.txt

CMD ["python", "-m", "email_emotion_worker.worker"]