from PIL import Image
import torch

from ai.clip_model import (
    model,
    preprocess,
    tokenizer,
    DEVICE
)


class EmbeddingService:

    @staticmethod
    def image_embedding(image_path):

        image = Image.open(image_path).convert("RGB")

        image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():

            embedding = model.encode_image(image_tensor)

            embedding /= embedding.norm(dim=-1, keepdim=True)

        return embedding.squeeze().cpu().tolist()

    @staticmethod
    def text_embedding(text):

        tokens = tokenizer([text]).to(DEVICE)

        with torch.no_grad():

            embedding = model.encode_text(tokens)

            embedding /= embedding.norm(dim=-1, keepdim=True)

        return embedding.squeeze().cpu().tolist()