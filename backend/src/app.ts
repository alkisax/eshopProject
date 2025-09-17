/* eslint-disable no-console */
 
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
// import type { NextFunction } from 'express';
import path from 'path';
import swaggerSpec from './utils/swagger';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './login/routes/auth.routes';
import userRoutes from './login/routes/user.routes';
import participantRoutes from './stripe/routes/participant.routes';
import transactionRoutes from './stripe/routes/transaction.routes';
import emailRoutes from './stripe/routes/email.routes';
import stripeRoutes from './stripe/routes/stripe.routes';
import commodityRoutes from './stripe/routes/commodity.routes';
import cartRoutes from './stripe/routes/cart.routes';
import uploadMulterRoutes from './uploadMulter/upload.routes';
import postRoutes from './blog/routes/post.routes';
import subPageRoutes from './blog/routes/subPage.routes';
import { stripeController } from './stripe/controllers/stripe.controller';
import categoryRoutes from './stripe/routes/category.routes';
import modarationRoutes from './aiModeration/moderation.routes'

const app = express();

app.use(cors());

// stripe checkout web hook is implemented here and not in usual routes/contoller type because it has to be raw and not json so its declared before app.use(express.json())
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

app.use(express.json());

// app.use((req: Request, _res: Response, next: NextFunction) => {
//   console.log("Request reached Express!");
//   console.log(`Incoming request: ${req.method} ${req.path}`);
//   next();
// });

app.get('/api/ping', (_req: Request, res: Response) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.get('/health', (_req, res) => {
  res.send('ok');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/participant', participantRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/commodity', commodityRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subpage', subPageRoutes);

app.use ('/api/moderationAi', modarationRoutes)
app.use('/api/upload-multer', uploadMulterRoutes);

app.use(express.static('dist')); 

// swagger test page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ SERVE UPLOADS BEFORE DIST
// ΠΡΟΣΟΧΗ το ../ στο path είναι συμαντικο. τα αρχεια μας βρίσκονται τελικά στον φάκελο dist
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// για να σερβίρει τον φακελο dist του front μετα το npm run build
// app.use(express.static('dist'));
app.use(express.static(path.join(__dirname, '../../dist')));

//αυτο είναι για να σερβίρει το index.html του front όταν ο χρήστης επισκέπτεται το root path ή οποιοδήποτε άλλο path που δεν είναι api ή api-docs
app.get(/^\/(?!api|api-docs).*/, (_req, res) => {
  // res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

export default app;