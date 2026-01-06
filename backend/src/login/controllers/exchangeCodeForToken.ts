// backend\src\login\controllers\exchangeCodeForToken.ts
/*
 εδώ πάμε να λύσουμε ένα συμαντικό security issue που είχαμε στα login me google auth και appwrite. τώρα είχαμε μες στον κώδικα διάφορα σαν

(και τα τρία στο backend\src\login\controllers\auth.controller.ts)
(το backend\src\login\controllers\auth.appwrite.controller.ts φένετε να είναι οκ)
export const googleLogin = async (req: Request, res: Response) => {
    // 5. Redirect to front if sign in
    // const frontendUrl = process.env.FRONTEND_URL;
    const message = `user ${dbUser.name} signed in`;
    return res.redirect(
      `${frontendUrl}/google-success?token=${token}&email=${
        dbUser.email
      }&message=${encodeURIComponent(message)}`
    );
  };

export const googleSignup = async (req: Request, res: Response) => {
  // 5. Redirect to front if sign in
  return res.redirect(
    `${frontendUrl}/google-success?token=${token}&email=${
      dbUser.email
    }&message=${encodeURIComponent(message)}`
  );
};

export const githubCallback = async (_req: Request, res: Response) => {
    // Redirect frontend with token & email
    res.redirect(
      `${process.env.FRONTEND_URL}/github-success?token=${token}&email=${dbUser.email}`
    );
};

αυτό είναι ένα συμαντικό προβλημα γιατί το ?token=${token} σημαίνει οτι οποιοσδήποτε μπορεί να έχει access στο token. αυτό που θα γίνει είναι οτι θα αλλαξουμε την λογική για αυτά και αντι να έχουμε:
  URL μεταφέρει token → Frontend το διαβάζει → localStorage → jwtDecode
θα κάνουμε
  URL μεταφέρει code (άχρηστο αν κλαπεί) → Frontend POST exchange → Backend επιστρέφει token → localStorage → jwtDecode

  ΣΗΜΑΝΤΙΚΟ:
  - Δεν αλλάζει το backend login (username/password)
  - Δεν αλλάζει το frontend validation
  - Αλλάζει ΜΟΝΟ ο τρόπος που φτάνει το token στο frontend
*/
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { userDAO } from '../dao/user.dao';
import { handleControllerError } from '../../utils/error/errorHandler';

// In-memory store για one-time codes
// Κάθε exchange code:
// - αντιστοιχεί σε έναν user
// - έχει provider (google / github / appwrite)
// - έχει χρόνο λήξης (TTL)
type ExchangeCodeEntry = {
  userId: string;
  provider: 'google' | 'github' | 'appwrite';
  expiresAt: number;
};

// θα έχουμε ένα dictionary που θα έχει key: και value: ένα obj  με τα useId, provider, χρόνο λήξης
const exchangeCodeStore = new Map<string, ExchangeCodeEntry>();


// Helper δημιουργία exchange code
// Αυτό ΔΕΝ είναι endpoint.
// Καλείται από OAuth controllers (googleLogin, githubCallback κλπ
// Αποθηκεύει: code → { userId, provider, expiresAt }
export const createExchangeCode = (
  code: string,
  entry: ExchangeCodeEntry
) => {
  exchangeCodeStore.set(code, entry);
};


// αυτό είναι το endpoint controller
// POST /api/auth/exchange-code
// body: { code }
export const exchangeCodeForToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code?: string };

    if (!code) {
      return res.status(400).json({
        status: false,
        error: 'exchange code is required',
      });
    }

    // Ψάχνουμε το code στη μνήμη
    const stored = exchangeCodeStore.get(code);

    if (!stored) {
      return res.status(401).json({
        status: false,
        error: 'invalid or already used exchange code',
      });
    }

    // one-time usage → το διαγράφουμε ΑΜΕΣΩΣ για να μην ξαναχρησιμοποιηθεί
    exchangeCodeStore.delete(code);

    // expiration check
    if (stored.expiresAt < Date.now()) {
      return res.status(401).json({
        status: false,
        error: 'exchange code expired',
      });
    }

    const user = await userDAO.toServerById(stored.userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        error: 'user not found',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // JWT payload ίδιο με backend / oauth logins
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        hasPassword: !!user.hashedPassword,
        provider: stored.provider,
      },
      secret,
      { expiresIn: '1d' }
    );

    // ολοκληρώνουμε το exchange δύνοντας τοκεν
    return res.status(200).json({
      status: true,
      data: { token },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
