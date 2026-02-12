import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
