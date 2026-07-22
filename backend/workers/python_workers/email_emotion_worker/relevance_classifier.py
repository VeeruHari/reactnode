from transformers import pipeline
#from common.business_config import BUSINESS_NAME, BUSINESS_DESCRIPTION

classifier = pipeline(
    "text-classification",
    model="/app/models/email_classifier",
    tokenizer="/app/models/email_classifier"
)

BUSINESS_NAME = "Pixel Gallery"

BUSINESS_DESCRIPTION = """
Pixel Gallery is an online marketplace for digital images.
Customers can browse, purchase, download and manage royalty-free images.
We provide support for image downloads, licensing, payments,
user accounts and upload issues.
"""

LABEL_MAP = {
    "LABEL_0": "Not Relevant",
    "LABEL_1": "Relevant"
}

def classify_relevance(email_text):

    text = (
        "Business Name: " + BUSINESS_NAME +
        "\n\nBusiness Description:\n" + BUSINESS_DESCRIPTION +
        "\n\nEmail:\n" + email_text
    )

    result = classifier(text)[0]

    return {
        "label": LABEL_MAP.get(result["label"], result["label"]),
        "confidence": round(result["score"], 4)
    }