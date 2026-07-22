import session from 'express-session';

export function getSessionSecret() {
  return process.env.SESSION_SECRET;
}

export function createSessionMiddleware() {
  return session({
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
    }
  });
}
