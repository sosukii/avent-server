import express from 'express';
import cors from 'cors';
import { router as routes } from './routes/routes.js';

const PORT = process.env.PORT || 5000
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

export async function start() {
  try {
    app.listen(PORT, "0.0.0.0", () => console.log(`♡ server started ${PORT}`));
  } catch (e) {
    console.log(e);
  }
}
