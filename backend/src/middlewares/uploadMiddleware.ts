import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
['videos', 'avatars', 'thumbnails', 'assignments'].forEach(subDir => {
  const dirPath = path.join(UPLOAD_ROOT, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let sub = 'thumbnails';
    if (file.mimetype.startsWith('video/')) {
      sub = 'videos';
    } else if (req.path.includes('avatar') || file.fieldname === 'avatar') {
      sub = 'avatars';
    } else if (req.path.includes('assignment') || file.fieldname === 'assignment') {
      sub = 'assignments';
    }
    cb(null, path.join(UPLOAD_ROOT, sub));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

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
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 250MB limit
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
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for assignment submissions
  },
  fileFilter: assignmentFilter,
});
