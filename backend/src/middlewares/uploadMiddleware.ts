import multer from 'multer';
import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const UPLOAD_ROOT = isVercel ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');

try {
  ['videos', 'avatars', 'thumbnails', 'assignments'].forEach(subDir => {
    const dirPath = path.join(UPLOAD_ROOT, subDir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
} catch (e) {
  // Ignore filesystem restriction on read-only environments
}

// Memory storage to eliminate all disk-write failures on Vercel serverless
const memoryStorage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/x-matroska',
    'video/quicktime',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only modern video and image formats are accepted.`));
  }
};

export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter,
});

const assignmentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedExts.includes(ext) && (allowedMimes.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(new Error('ZIP and archive files are not allowed. Please upload your work as a PDF or image (PNG, JPG, WEBP).'));
  }
};

export const uploadAssignment = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: assignmentFilter,
});
