import multer from 'multer';
import path from 'path';
import fs from 'fs';

function makeStorage(subfolder) {
  const dir = path.join(process.cwd(), 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${req.userId}-${Date.now()}${ext}`;
      cb(null, name);
    },
  });
}

export const uploadAvatar = multer({ storage: makeStorage('avatars') });
export const uploadPrescription = multer({ storage: makeStorage('prescriptions') });
