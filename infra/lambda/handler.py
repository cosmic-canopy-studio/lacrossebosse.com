import json
import re
import boto3
from datetime import datetime, timezone

ses = boto3.client("ses")

FROM_EMAIL = "noreply@lacrossebosse.com"
TO_EMAIL = "support@lacrossebosse.com"
ALLOWED_ORIGIN = "https://lacrossebosse.com"


def handler(event, context):
    origin = event.get("headers", {}).get("origin", "")
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    }

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return {"statusCode": 204, "headers": headers, "body": ""}

    try:
        body = json.loads(event.get("body", "{}"))
    except (json.JSONDecodeError, TypeError):
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Invalid JSON"})}

    if body.get("captcha"):
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"status": "ok"})}

    email = (body.get("email") or "").strip()
    club = (body.get("club") or "").strip()

    if not email or not re.match(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(email) > 254:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Valid email required"})}

    if not club or len(club) > 200:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Club name required (max 200 chars)"})}

    source_ip = event.get("requestContext", {}).get("http", {}).get("sourceIp", "unknown")
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    try:
        ses.send_email(
            Source=FROM_EMAIL,
            Destination={"ToAddresses": [TO_EMAIL]},
            ReplyToAddresses=[email],
            Message={
                "Subject": {"Data": f"Early Access Request: {club}"},
                "Body": {"Text": {"Data": f"Email: {email}\nClub: {club}\nIP: {source_ip}\nTime: {timestamp}"}},
            },
        )
    except Exception:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"error": "Failed to send. Try again later or email support@lacrossebosse.com directly."})}

    return {"statusCode": 200, "headers": headers, "body": json.dumps({"status": "ok"})}
