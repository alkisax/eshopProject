/* eslint-disable no-console */
// λειτουργεί ως middleware και το καλούμε στα routes
// router.post('/', upload.single('image'), uploadController.uploadFile);
// αυτό εδώ θα δημιουργήσει ένα req.file που θα χρησιμοποιήθεί στον controller
import multer from 'multer';
import path from 'path';
import type { Request } from 'express';

//export γιατι θα το χρησιμοποιήσω και στον controller
export const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// μέθοδος που δημιουργεί έναν τρόπο αποθήκευσης αρχείων στο δίσκο (στον υπολογιστή). Με αυτήν καθορίζουμε πού θα αποθηκευτεί το αρχείο και πώς θα ονομαστεί.
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    console.log('reached multer service');   
    // null -> το δεχόμαστε, UPLOAD_DIR=path.join(__dirname, '../uploads') -> ο φάκελος που θα αποθηκευτούν τα αρχεία
    cb(null, UPLOAD_DIR);
  },
  // πως θα ονομαστεί το αρχείο όταν αποθηκευτεί
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // const ext = path.extname(file.originalname);
    // cb(null, file.fieldname + '-' + Date.now() + ext);
    cb(null, file.originalname);
  }
});

// αυτό είναι ένας middleware που θα πιάσει το αρχείο που θα στείλει ο χρήστης και θα το αποθηκεύσει στον φάκελο uploads
const upload = multer({ 
  // καθοριζει που θα αποθηκεύονται τα αρχεία οριζετε στην παραπάνω const
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB in bytes
  },
  // Το fileFilter είναι μια συνάρτηση που ελέγχει κάθε αρχείο πριν αποθηκευτεί.
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('reached multer upload');
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
    
    // παιρνει τοn τύπο του αρχειου πχ png jpg κλπ
    const ext = path.extname(file.originalname).toLowerCase();
    console.log('Uploading file:', file.originalname, file.mimetype);
    
    // callback συνάρτηση που πρέπει να καλέσεις για να πεις αν αποδεχεσαι το αρχείο ή όχι.
    if (allowedExtensions.includes(ext)){
      cb(null, true);
    } else {
      cb(new Error('Only images, PDF, txt, and Word documents are allowed'));
    }
  }
});

export default upload;
