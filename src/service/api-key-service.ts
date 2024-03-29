import jwt from 'jsonwebtoken';

export function generateSignedApiKey(props: object, expiresIn?: string) {
  return jwt.sign(props, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn ?? process.env.VERIFICATION_JWT_EXPIRY_TIME,
  });
}

export function decryptSignedApiKey(key: string) {
  return jwt.verify(key, process.env.JWT_SECRET_KEY);
}
