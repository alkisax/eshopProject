/* eslint-disable quotes */
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
import modarationRoutes from './aiModeration/moderation.routes';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

const allowedOrigins = [
  `${process.env.FRONTEND_URL}`,
  `${process.env.BACKEND_URL}`,
  `${process.env.DEPLOY_URL}`,
  'https://cloud.appwrite.io', 
];
// app.use(cors());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(null, false); // simply reject without crashing
    },
    // credentials: true, // set true if you use cookies for auth
  })
);

// stripe checkout web hook is implemented here and not in usual routes/contoller type because it has to be raw and not json so its declared before app.use(express.json())
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

app.use(express.json());

// library for securing. With only helmet() covers: sniffing, clickjacking, HSTS
app.use(helmet());
// το helmet() δεν μου επέτρεπε να δω τις εικόνες απο το appwrite ή να μπω στο stripe etc. Εδω προσθέτουμε εξαιρέσεις για αυτό
// **ΠΡΟΣΟΧΗ** αυτη είναι η πιθανοτερη πηγη δυσλειτουργίας third party
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'",
        "https://js.stripe.com",
        "https://www.google.com",
        "https://maps.google.com"
      ],
      // imgSrc: ["'self'", "data:", "https://cloud.appwrite.io", "https://fra.cloud.appwrite.io"], // αυτο λειτουργούσε αλλλα αφαιρέθηκε, **ΝΑ ΠΡΟΣΤΕΘΕΙ ΞΑΝΑ** δες επόμενο σχόλιο
      imgSrc: ["'self'", "data:", "https:"], // η εφαρμογή μου είχε πολλές φωτογραφίες απο διάφορα url απο το ιντερνετ. βάλαμε αυτό γιατί τις έκοβε το helmet αλλα τώρα δεν είναι ασφαλές
      connectSrc: ["'self'", "https://cloud.appwrite.io", "https://fra.cloud.appwrite.io"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);
// needs or problems on deploy -helmet-
app.set('trust proxy', 1);

// app.use((req: Request, _res: Response, next: NextFunction) => {
//   console.log("Request reached Express!");
//   console.log(`Incoming request: ${req.method} ${req.path}`);
//   next();
// });

// global limiter η βιβλιοθήκε αυτή βάζει όριο στο πόσα req θα δεχτεί απο κάθε ip με αποτέλεσμα να εμποδίζει DDOS επιθέσεις
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, // 200 requests / 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

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

app.use ('/api/moderationAi', modarationRoutes);
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