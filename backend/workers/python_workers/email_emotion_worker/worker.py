import json
import os
import pika
import time
import traceback

from common.database import get_connection
from .emotion_classifier import classify_email
from .relevance_classifier import classify_relevance

while True:
    try:
        url = os.environ["RABBITMQ_URL"]
        print(f"Connecting to: {url}")

        connection = pika.BlockingConnection(
            pika.URLParameters(url)
        )

        print("Connected to RabbitMQ")
        break

    except Exception:
        traceback.print_exc()
        print("Retrying in 5 seconds...")
        time.sleep(5)

channel = connection.channel()

channel.queue_declare(
    queue="emotion-analysis",
    durable=True
)

def callback(ch, method, properties, body):
    job = json.loads(body)

    try:
        print("Received:", job)

        # Analyze emotion
        result = classify_email(job["emailContent"])

        result_relevance = classify_relevance(job["emailContent"])

        print(result_relevance)
        print(result)

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()

    # Database connection
    db = get_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            UPDATE contact_messages
            SET emotion = %s,
                emotion_confidence = %s,
                relevance = %s,
                relevance_confidence = %s,
                updated_at = NOW()
            WHERE id = %s
            """,
            (
                result["emotion"],
                result["confidence"],
                result_relevance["label"],
                result_relevance["confidence"],
                job["messageId"],
            )
        )

        db.commit()

        print(f"Updated message {job['messageId']}")

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        db.rollback()
        print("Database Error:", e)

    finally:
        cursor.close()

channel.basic_consume(
    queue="emotion-analysis",
    on_message_callback=callback
)

print("Python worker waiting for jobs...")

channel.start_consuming()