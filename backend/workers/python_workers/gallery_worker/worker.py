import json
import os

import pika

from ai.embedding_service import EmbeddingService
from ai.qdrant_service import QdrantService

qdrant = QdrantService()

credentials = pika.PlainCredentials(
    os.getenv("RABBITMQ_USER"),
    os.getenv("RABBITMQ_PASSWORD")
)

connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
        port=int(os.getenv("RABBITMQ_PORT", 5672)),
        credentials=credentials,
    )
)

channel = connection.channel()

channel.queue_declare(queue="gallery_embedding")


def callback(ch, method, properties, body):

    message = json.loads(body)

    gallery_id = message["gallery_id"]

    image = message["image"]

    title = message["title"]

    description = message["description"]

    image_path = os.path.join(
        "/app/uploads/gallery",
        image
    )

    vector = EmbeddingService.image_embedding(image_path)

    payload = {
        "gallery_id": gallery_id,
        "title": title,
        "description": description,
        "image": image
    }

    qdrant.save_vector(
        gallery_id,
        vector,
        payload
    )

    print(f"Gallery {gallery_id} embedded.")


channel.basic_consume(
    queue="gallery_embedding",
    auto_ack=True,
    on_message_callback=callback
)

print("Gallery Worker Started")

channel.start_consuming()