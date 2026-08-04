from ai.embedding_service import EmbeddingService
from ai.qdrant_service import QdrantService


class SearchService:

    def __init__(self):
        self.qdrant = QdrantService()

    def search_by_text(self, text, limit=10):

        vector = EmbeddingService.text_embedding(text)

        results = self.qdrant.search(
            vector=vector,
            limit=limit
        )

        return [
            {
                "gallery_id": point.id,
                "score": float(point.score),
                "payload": point.payload
            }
            for point in results
        ]

    def search_by_image(self, image_path, limit=10):

        vector = EmbeddingService.image_embedding(image_path)

        results = self.qdrant.search(
            vector=vector,
            limit=limit
        )

        return [
            {
                "gallery_id": point.id,
                "score": float(point.score),
                "payload": point.payload
            }
            for point in results
        ]