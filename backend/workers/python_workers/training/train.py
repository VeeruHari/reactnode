import os
import pandas as pd
from datasets import Dataset
#from common.business_config import BUSINESS_NAME, BUSINESS_DESCRIPTION
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)

# -----------------------------
# Configuration
# -----------------------------
MODEL_NAME = "distilbert-base-uncased"
DATASET_PATH = "/app/data/emails.csv"
OUTPUT_DIR = "/app/models/email_classifier"

BUSINESS_NAME = "Pixel Gallery"

BUSINESS_DESCRIPTION = """
Pixel Gallery is an online marketplace for digital images.
Customers can browse, purchase, download and manage royalty-free images.
We provide support for image downloads, licensing, payments,
user accounts and upload issues.
"""

# -----------------------------
# Load CSV
# -----------------------------
print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

# Build the text used for training
df["text"] = (
    "Business Name: " + BUSINESS_NAME +
    "\n\nBusiness Description:\n" + BUSINESS_DESCRIPTION +
    "\n\nEmail:\n" + df["text"]
)

# Convert labels
label_map = {
    "Relevant": 1,
    "Not Relevant": 0
}

df["label"] = df["label"].map(label_map)

if df["label"].isnull().any():
    raise ValueError(
        "Dataset contains labels other than 'Relevant' and 'Not Relevant'."
    )

print(df.head())

# -----------------------------
# Convert to HF Dataset
# -----------------------------
dataset = Dataset.from_pandas(
    df[["text", "label"]]
)

# Split train/test
dataset = dataset.train_test_split(
    test_size=0.2,
    seed=42
)

train_dataset = dataset["train"]
test_dataset = dataset["test"]

# -----------------------------
# Tokenizer
# -----------------------------
print("Loading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        padding="max_length",
        max_length=128,
    )

train_dataset = train_dataset.map(tokenize)
test_dataset = test_dataset.map(tokenize)

train_dataset = train_dataset.remove_columns(["text"])
test_dataset = test_dataset.remove_columns(["text"])

train_dataset = train_dataset.rename_column("label", "labels")
test_dataset = test_dataset.rename_column("label", "labels")

train_dataset.set_format("torch")
test_dataset.set_format("torch")

# -----------------------------
# Model
# -----------------------------
print("Loading model...")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2
)

# -----------------------------
# Training
# -----------------------------
training_args = TrainingArguments(
    output_dir="/app/results",
    num_train_epochs=5,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    learning_rate=2e-5,
    logging_steps=1,
    eval_strategy="epoch",
    save_strategy="epoch",
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
)

print("Starting training...")

trainer.train()

print("Training completed.")

# -----------------------------
# Save model
# -----------------------------
os.makedirs(OUTPUT_DIR, exist_ok=True)

trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("Model saved successfully!")
print("Saved to:", OUTPUT_DIR)