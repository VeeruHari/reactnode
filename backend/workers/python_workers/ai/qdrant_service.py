from qdrant_client import QdrantClient

from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct
)


class QdrantService:

    def __init__(self):

        self.client = QdrantClient(
            host="qdrant",
            port=6333
        )

        self.collection = "gallery"

        self.create_collection()

    def create_collection(self):

        collections = self.client.get_collections()

        names = [c.name for c in collections.collections]

        if self.collection not in names:

            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=512,
                    distance=Distance.COSINE
                )
            )

    def save_vector(
        self,
        gallery_id,
        vector,
        payload
    ):

        self.client.upsert(
            collection_name=self.collection,
            points=[
                PointStruct(
                    id=gallery_id,
                    vector=vector,
                    payload=payload
                )
            ]
        )

    def delete_vector(
        self,
        gallery_id
    ):

        self.client.delete(
            collection_name=self.collection,
            points_selector=[gallery_id]
        )

    def search(
        self,
        vector,
        limit=10,
        score_threshold=0.25,
        query_filter=None
    ):

        response = self.client.query_points(
            collection_name=self.collection,
            query=vector,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=query_filter,
            with_payload=True,
            with_vectors=False,
        )

        return response.points