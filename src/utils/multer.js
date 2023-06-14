import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName); 
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.mp3') {
      cb(new Error('File type is not supported'), false);
      return;
    }
    cb(null, true);
  },
});

export default upload;

