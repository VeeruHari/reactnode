from transformers import pipeline

# Load the model once when the worker starts
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

def classify_email(email_text: str) -> dict:

    if not email_text or not email_text.strip():
        return {"emotion": "neutral", "confidence": 0.0}

    result = classifier(email_text)[0][0]

    return {
        "emotion": result["label"].lower(),
        "confidence": round(float(result["score"]), 4)
    }