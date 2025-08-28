import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// MIDDLEWARES
// Morgan logging middleware - with fallback for dependency timing issues
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  // Fallback for development when NODE_ENV isn't set during import
  // (Due to timing issues with newer dependency versions)
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Hello from the middlware 🖐️');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
