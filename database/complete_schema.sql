-- Criar todas as tabelas necessárias para o Manipularium
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Tabela para armazenar os dias de conferência
CREATE TABLE IF NOT EXISTS conference_days (
    day_key VARCHAR(20) PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar as transações bancárias
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    day_key VARCHAR(20) NOT NULL REFERENCES conference_days(day_key) ON DELETE CASCADE,
    original_id INTEGER NOT NULL,
    date_value VARCHAR(20) NOT NULL,
    historico TEXT NOT NULL,
    cpf_cnpj VARCHAR(50),
    valor DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'needs-review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar valores não encontrados
CREATE TABLE IF NOT EXISTS not_found_values (
    id SERIAL PRIMARY KEY,
    day_key VARCHAR(20) NOT NULL REFERENCES conference_days(day_key) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar backups
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    is_auto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_day_key ON transactions(day_key);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_valor ON transactions(valor);
CREATE INDEX IF NOT EXISTS idx_not_found_values_day_key ON not_found_values(day_key);
CREATE INDEX IF NOT EXISTS idx_backups_timestamp ON backups(timestamp DESC);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conference_days_updated_at ON conference_days;
CREATE TRIGGER update_conference_days_updated_at 
    BEFORE UPDATE ON conference_days 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE not_found_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso total (ajustar conforme necessário)
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on not_found_values" ON not_found_values;
CREATE POLICY "Allow all operations on not_found_values" ON not_found_values FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on conference_days" ON conference_days;
CREATE POLICY "Allow all operations on conference_days" ON conference_days FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on backups" ON backups;
CREATE POLICY "Allow all operations on backups" ON backups FOR ALL USING (true);

-- Inserir dados de teste (opcional)
-- INSERT INTO conference_days (day_key, status) VALUES ('01/01/2025', 'pending') ON CONFLICT DO NOTHING;