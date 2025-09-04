// Utilitários para upload de arquivos no Next.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar multer para Next.js
const upload = multer({
  dest: path.join(process.cwd(), 'public/uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xls', '.xlsx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use CSV, XLS ou XLSX.'));
    }
  }
});

// Middleware helper para Next.js
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Criar handler para upload
export function createUploadHandler() {
  return upload.single('file');
}

// Garantir que o diretório de uploads existe
export function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}