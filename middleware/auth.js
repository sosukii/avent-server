import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRETKEY;

export default function (req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'пользователь не авторизован!' });
    }

    const decodeData = jwt.verify(token, SECRET_KEY);
    req.user = decodeData;

    next();
  } catch (e) {
    return res.status(401).json({ message: 'пользователь не авторизован!' });
  }
}
