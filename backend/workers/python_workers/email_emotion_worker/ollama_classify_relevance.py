from ollama import Client
import json

client = Client(host="http://ollama:11434")

def classify_relevance(email_text, business_name, business_description):
    prompt = f"""
        Business Name:
        {business_name}

        Business Description:
        {business_description}

        Email:
        {email_text}

        Return ONLY JSON:

        {{
        "isRelevant": true,
        "reason": "",
        "intent": "",
        "priority": ""
        }}
        """

    response = client.chat(
        model="gemma3:4b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return json.loads(response["message"]["content"])