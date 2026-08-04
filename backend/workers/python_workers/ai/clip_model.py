import torch
import open_clip

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print("Loading CLIP model...")

model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32",
    pretrained="laion2b_s34b_b79k"
)

model.to(DEVICE)
model.eval()

tokenizer = open_clip.get_tokenizer("ViT-B-32")

print("CLIP model loaded.")