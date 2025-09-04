# Manipularium - Sistema de Conferência

<div align="center">
  <img src="public/images/logo.svg" alt="Manipularium Logo" height="80">
  <br><br>
</div>

Sistema de conferência bancária e de caixa desenvolvido em Node.js com Express.

## Características

- ✅ **Conferência Bancária**: Upload e processamento de planilhas Excel/CSV
- ✅ **Sistema de Backup**: Pontos de restauração automáticos e manuais
- ✅ **Persistência de dados**: Armazenamento em arquivos JSON no servidor
- ✅ **Interface responsiva**: Design moderno com Tailwind CSS
- ✅ **Validação de dados**: Processamento robusto de arquivos Excel
- 🔄 **Conferência de Caixa**: Em desenvolvimento

## Tecnologias Utilizadas

- **Framework**: Next.js 15.5.2 + React 19.1.1
- **Backend**: Node.js, Express.js (API Legacy)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Upload**: Multer
- **Processamento Excel**: XLSX
- **Frontend**: React, Next.js, Tailwind CSS
- **Segurança**: Helmet, CORS
- **Deploy**: Vercel (otimizado)

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd manipularium
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados:
   - Acesse seu projeto no [Supabase Dashboard](https://plazfamleohfuxnvybsm.supabase.co)
   - Vá para "SQL Editor"
   - Execute o conteúdo do arquivo `database/complete_schema.sql`

5. Inicie o servidor:
```bash
# Next.js (Recomendado)
npm run dev          # Desenvolvimento (porta 3001)
npm run build        # Build para produção
npm start           # Produção Next.js

# Express (Legacy)
npm run express     # Express servidor (porta 3000)
npm run express:dev # Express desenvolvimento
```

6. Acesse a aplicação:
```
# Next.js (Interface Moderna)
http://localhost:3001

# Express (Interface Original)  
http://localhost:3000
```

## Estrutura do Projeto

```
manipularium/
├── pages/              # Next.js Pages (Interface Moderna)
│   ├── api/           # API Routes do Next.js
│   └── index.js       # Página principal Next.js
├── src/               # Express Backend (Legacy)
│   ├── controllers/   # Controladores da aplicação
│   ├── routes/        # Definição das rotas Express  
│   ├── models/        # Modelos e lógica de dados
│   └── app.js         # Aplicação Express
├── public/
│   ├── images/        # Logo e imagens
│   └── js/            # JavaScript do frontend
├── views/             # Interface HTML original
│   └── index.html     # Interface Express
├── lib/               # Utilitários Next.js
├── components/        # Componentes React (futuro)
├── data/              # Dados persistentes
├── database/          # Scripts SQL
└── next.config.js     # Configuração Next.js
```

## API Endpoints

### Dados
- `GET /api/data` - Obter todos os dados
- `POST /api/data` - Salvar dados
- `POST /api/data/backup` - Criar backup
- `POST /api/data/restore` - Restaurar backup
- `DELETE /api/data` - Limpar todos os dados
- `PUT /api/data/day/:dayKey` - Atualizar dados de um dia

### Arquivos
- `POST /api/files/upload` - Upload e processamento de planilhas

## Funcionalidades

### Conferência Bancária
1. **Upload de Planilhas**: Suporte a arquivos .csv, .xls, .xlsx
2. **Processamento Inteligente**: Detecção automática de colunas (Data, Histórico, Valor)
3. **Conferência de Valores**: Sistema de busca e marcação de transações
4. **Gestão de Ambiguidades**: Resolução de múltiplas correspondências
5. **Valores Não Encontrados**: Lista de valores não conferidos
6. **Sistema de Backup**: Pontos de restauração automáticos e manuais

### Segurança
- Sistema protegido por senha (1034)
- Validação de tipos de arquivo
- Sanitização de dados de entrada
- Headers de segurança com Helmet

## Desenvolvimento

Para desenvolvimento local:

```bash
npm run dev
```

Isso iniciará o servidor com nodemon para recarregamento automático.

## Scripts Disponíveis

### Next.js (Recomendado)
- `npm run dev` - Inicia servidor de desenvolvimento Next.js (porta 3001)
- `npm run build` - Faz build para produção
- `npm start` - Inicia servidor Next.js em produção
- `npm run lint` - Executa linter do Next.js

### Express (Legacy)
- `npm run express` - Inicia servidor Express (porta 3000)  
- `npm run express:dev` - Express desenvolvimento com nodemon

### Banco de Dados
- `npm run db:create` - Verifica a estrutura do banco de dados
- `npm run db:init` - Inicializa o banco de dados

### Deploy e Backup
- `npm run deploy` - Deploy para Vercel produção
- `npm run deploy:preview` - Deploy preview
- `npm run backup` - Criar backup do projeto
- `npm run backup:list` - Listar backups

## Autor

Criado por Gustavo Mazzon - Versão Node.js (04/09/2025)