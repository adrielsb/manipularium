-- Tabela para dias de conferência de caixa
CREATE TABLE IF NOT EXISTS caixa_days (
  id SERIAL PRIMARY KEY,
  day_key VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para transações de caixa
CREATE TABLE IF NOT EXISTS caixa_transactions (
  id SERIAL PRIMARY KEY,
  day_key VARCHAR(20) NOT NULL REFERENCES caixa_days(day_key) ON DELETE CASCADE,
  original_id INTEGER NOT NULL,
  date_value VARCHAR(20) NOT NULL,
  historico TEXT NOT NULL,
  cpf_cnpj VARCHAR(20),
  valor DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transferred_at TIMESTAMP,
  original_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para valores não encontrados globais
CREATE TABLE IF NOT EXISTS valores_nao_encontrados_global (
  id SERIAL PRIMARY KEY,
  valor DECIMAL(15,2) NOT NULL,
  dia VARCHAR(20) NOT NULL,
  data_hora TIMESTAMP NOT NULL,
  tentativas INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_caixa_transactions_day_key ON caixa_transactions(day_key);
CREATE INDEX IF NOT EXISTS idx_caixa_transactions_original_id ON caixa_transactions(original_id);
CREATE INDEX IF NOT EXISTS idx_valores_global_dia ON valores_nao_encontrados_global(dia);
CREATE INDEX IF NOT EXISTS idx_valores_global_data_hora ON valores_nao_encontrados_global(data_hora DESC);

-- Comentários
COMMENT ON TABLE caixa_days IS 'Dias de conferência de caixa';
COMMENT ON TABLE caixa_transactions IS 'Transações transferidas para conferência de caixa';
COMMENT ON TABLE valores_nao_encontrados_global IS 'Histórico global de valores não encontrados durante conferências';