import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../db/models/User.js';

dotenv.config();

const SECRET_KEY = process.env.SECRETKEY;
export const router = Router();

router.post(
  '/registration',
  [
    check('email', 'Некорректный e-mail').isEmail(),
    check(
      'password',
      'Пароль должен содержать не менее 3-х символов, но не более 12-ти символов'
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Некорректные данные при регистрации',
          errors: errors.array(),
        });
      }

      const { email, password, name } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res.status(400).json({
          message: `Пользователь с e-mail (${email}) уже существует.`,
        });
      }
      const hashPassword = await bcrypt.hash(password, 7);

      const user = new User({ email, password: hashPassword, name });
      await user.save();

      return res.status(200).json({ message: 'Пользователь создан.' });
    } catch (e) {
      res.send({ message: 'Серверная ошибка, попробуйте позже' });
    }
  }
);
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'Пользователь с таким e-mail не найден' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный пароль.' });
    }

    const { id, roles } = user;
    const token = jwt.sign({ id, roles }, SECRET_KEY, { expiresIn: '12h' });

    return res.json({
      token,
      user: { id, email },
      message: 'Вход в аккаунт - успешно!',
    });
  } catch (e) {
    res.send({ message: 'Серверная ошибка, попробуйте позже' });
  }
});
