const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Configuração do multer para upload de arquivos
// Usar memoryStorage em produção (Vercel) e diskStorage em desenvolvimento
const storage = process.env.VERCEL ? 
  multer.memoryStorage() :
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../public/uploads/'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use apenas .csv, .xls ou .xlsx'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite
  }
});

// Middleware de debug
router.post('/upload', (req, res, next) => {
  console.log('🔍 Request recebida em /api/files/upload');
  console.log('📦 Headers:', req.headers['content-type']);
  next();
});

// POST /api/files/upload - Upload e processamento de arquivo
router.post('/upload', upload.single('planilha'), (req, res, next) => {
  console.log('📤 Após multer - arquivo:', req.file ? req.file.originalname : 'nenhum');
  if (!req.file) {
    console.log('⚠️ Nenhum arquivo recebido pelo multer');
  }
  next();
}, fileController.uploadFile.bind(fileController));

module.exports = router;