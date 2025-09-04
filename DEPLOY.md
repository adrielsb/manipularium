# Deploy no Vercel - Manipularium

## 📋 Pré-requisitos

1. **Conta no Vercel**: https://vercel.com
2. **Conta no GitHub**: Projeto deve estar no GitHub
3. **Variáveis do Supabase**: URL e Service Role Key

## 🚀 Passos para Deploy

### 1. Preparar o Repositório
```bash
# Fazer commit das alterações
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 2. Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe o repositório `manipularium` do GitHub
4. Configure as seguintes **Environment Variables**:

```env
SUPABASE_URL=https://wjyjhytfkqdbnxyowrhy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
NODE_ENV=production
```

### 3. Deploy Automático
- O Vercel fará o deploy automaticamente
- Cada push na branch `main` gatilha um novo deploy

### 4. Scripts Disponíveis
```bash
# Deploy para produção
npm run deploy

# Deploy preview (branch/PR)
npm run deploy:preview

# Build local
npm run build
```

## 🔧 Configurações Importantes

### Estrutura Serverless
- ✅ `api/index.js` - Entry point para Vercel
- ✅ `vercel.json` - Configuração de rotas e build
- ✅ Condição para não executar `app.listen()` em produção

### Variáveis de Ambiente Obrigatórias
- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (não a anon key!)

### Funcionalidades Verificadas
- ✅ Upload de arquivos (limitado a 10MB no Vercel)
- ✅ Conexão com Supabase
- ✅ Servir arquivos estáticos
- ✅ API Routes funcionando

## 🌐 URL de Produção
Após o deploy, sua aplicação estará disponível em:
```
https://manipularium-seu-usuario.vercel.app
```

## 🔍 Troubleshooting

### Erro: Function timeout
- Verificar se `maxDuration` está configurado no `vercel.json`
- Otimizar operações longas

### Erro: Module not found
- Verificar se todas as dependências estão no `package.json`
- Caminhos relativos devem estar corretos

### Erro: Database connection
- Verificar se as variáveis de ambiente estão configuradas
- Testar conexão com Supabase localmente

## 📊 Monitoramento
- Logs disponíveis no dashboard do Vercel
- Analytics e performance no painel

## 🔐 Credenciais de Acesso
- **Usuário:** `admin`
- **Senha:** `manipularium`
- **Nota:** Sistema sem cadastro - apenas login fixo com interface moderna