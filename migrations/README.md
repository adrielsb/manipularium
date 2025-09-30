# Migrações do Banco de Dados

## Como executar as migrações no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie o conteúdo do arquivo de migração desejado
6. Cole no editor SQL
7. Clique em **Run** para executar

## Migrações disponíveis

### `add_caixa_and_valores_tables.sql`
**Data:** 2025-09-30
**Descrição:** Adiciona suporte para:
- Conferência de caixa (caixa_days, caixa_transactions)
- Histórico global de valores não encontrados (valores_nao_encontrados_global)

**IMPORTANTE:** Execute esta migração para corrigir o problema de perda de dados ao atualizar a página.

## Verificar se as tabelas foram criadas

Execute este SQL no SQL Editor do Supabase:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('caixa_days', 'caixa_transactions', 'valores_nao_encontrados_global');
```

Você deve ver as 3 tabelas listadas.