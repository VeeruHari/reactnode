export async function verifyTurnstileToken(token, secretKey) {
  if (process.env.SKIP_TURNSTILE === "true" || process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!secretKey) {
    throw new Error("Turnstile secret key is not configured.");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token
    })
  });

  const data = await response.json();
  return data.success === true;
}

function turnstileMiddleware(req, res, next) {
  req.verifyTurnstileToken = verifyTurnstileToken;
  next();
}

export default turnstileMiddleware;
