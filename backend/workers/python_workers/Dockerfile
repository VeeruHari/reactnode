FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.7.1 torchvision==0.22.1

RUN pip install --no-cache-dir \
    -r requirements.txt

CMD ["python", "-m", "email_emotion_worker.worker"]