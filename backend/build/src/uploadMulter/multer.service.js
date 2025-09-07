"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = void 0;
/* eslint-disable no-console */
// λειτουργεί ως middleware και το καλούμε στα routes
// router.post('/', upload.single('image'), uploadController.uploadFile);
// αυτό εδώ θα δημιουργήσει ένα req.file που θα χρησιμοποιήθεί στον controller
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
//export γιατι θα το χρησιμοποιήσω και στον controller
exports.UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// μέθοδος που δημιουργεί έναν τρόπο αποθήκευσης αρχείων στο δίσκο (στον υπολογιστή). Με αυτήν καθορίζουμε πού θα αποθηκευτεί το αρχείο και πώς θα ονομαστεί.
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        console.log('reached multer service');
        // null -> το δεχόμαστε, UPLOAD_DIR=path.join(__dirname, '../uploads') -> ο φάκελος που θα αποθηκευτούν τα αρχεία
        cb(null, exports.UPLOAD_DIR);
    },
    // πως θα ονομαστεί το αρχείο όταν αποθηκευτεί
    filename: (_req, file, cb) => {
        // const ext = path.extname(file.originalname);
        // cb(null, file.fieldname + '-' + Date.now() + ext);
        cb(null, file.originalname);
    }
});
// αυτό είναι ένας middleware που θα πιάσει το αρχείο που θα στείλει ο χρήστης και θα το αποθηκεύσει στον φάκελο uploads
const upload = (0, multer_1.default)({
    // καθοριζει που θα αποθηκεύονται τα αρχεία οριζετε στην παραπάνω const
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB in bytes
    },
    // Το fileFilter είναι μια συνάρτηση που ελέγχει κάθε αρχείο πριν αποθηκευτεί.
    fileFilter: (_req, file, cb) => {
        console.log('reached multer upload');
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
        // παιρνει τοn τύπο του αρχειου πχ png jpg κλπ
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        console.log('Uploading file:', file.originalname, file.mimetype);
        // callback συνάρτηση που πρέπει να καλέσεις για να πεις αν αποδεχεσαι το αρχείο ή όχι.
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only images, PDF, txt, and Word documents are allowed'));
        }
    }
});
exports.default = upload;
//# sourceMappingURL=multer.service.js.map