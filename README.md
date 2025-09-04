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

- **Backend**: Node.js, Express.js
- **Banco de Dados**: Supabase (PostgreSQL)
- **Upload**: Multer
- **Processamento Excel**: XLSX
- **Frontend**: HTML5, JavaScript ES6, Tailwind CSS
- **Segurança**: Helmet, CORS

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
# Desenvolvimento
npm run dev

# Produção
npm start
```

6. Acesse a aplicação:
```
http://localhost:3000
```

## Estrutura do Projeto

```
manipularium/
├── src/
│   ├── controllers/     # Controladores da aplicação
│   ├── routes/         # Definição das rotas
│   ├── models/         # Modelos e lógica de dados
│   └── app.js          # Aplicação principal
├── public/
│   ├── images/         # Logo e imagens
│   ├── js/             # JavaScript do frontend
│   └── uploads/        # Arquivos temporários de upload
├── views/
│   └── index.html      # Interface principal
├── data/               # Dados persistentes (criado automaticamente)
├── database/           # Scripts SQL
└── package.json
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
- **Sistema de Login**: Usuário `admin` / Senha `manipularium`
- **Tela de Autenticação**: Interface moderna com validação
- **Sessão Persistente**: Autenticação mantida durante navegação
- **Logout Seguro**: Botão de saída limpa a sessão
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

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm run build` - Executa verificações de integridade do projeto
- `npm run db:create` - Verifica a estrutura do banco de dados
- `npm run db:init` - Inicializa o banco de dados
- `npm run backup` - Criar backup do projeto
- `npm run backup:list` - Listar backups disponíveis
- `npm run deploy` - Deploy para Vercel produção
- `npm run deploy:preview` - Deploy preview

## Autor

Criado por Gustavo Mazzon - Versão Node.js (04/09/2025)