const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const dataRoutes = require('./routes/dataRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar banco de dados
const DataStorage = require('./models/HybridDataStorage');
DataStorage.initDatabase().catch(console.error);

// Middlewares de segurança e logging
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan('combined'));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));

// Rotas da API
app.use('/api/data', dataRoutes);
app.use('/api/files', fileRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
  });
});

// Only listen in non-serverless environments
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Manipularium rodando na porta ${PORT}`);
    console.log(`📂 Acesse: http://localhost:${PORT}`);
  });
}

module.exports = app;