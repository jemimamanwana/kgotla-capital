-- ============================================
-- KGOTLA CAPITAL - SUPABASE DATABASE SCHEMA
-- SME Bond Securitization Platform
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER MANAGEMENT (FR-1, FR-2, FR-3, FR-4)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    organization TEXT,
    role TEXT NOT NULL CHECK (role IN ('sme', 'investor', 'regulator', 'admin')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    national_id TEXT,
    tax_id TEXT,
    kyc_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SME PROFILES (FR-5, FR-6, FR-7, FR-8)
-- ============================================
CREATE TABLE smes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    sector TEXT NOT NULL,
    email TEXT,
    registration_no TEXT,
    tax_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    
    -- Financial Data (FR-6)
    revenue NUMERIC DEFAULT 0,
    expenses NUMERIC DEFAULT 0,
    net_income NUMERIC DEFAULT 0,
    total_assets NUMERIC DEFAULT 0,
    total_liabilities NUMERIC DEFAULT 0,
    current_assets NUMERIC DEFAULT 0,
    current_liabilities NUMERIC DEFAULT 0,
    
    -- Key Ratios (FR-6)
    liquidity_ratio NUMERIC,
    leverage_ratio NUMERIC,
    profitability_ratio NUMERIC,
    
    -- Credit Scoring (FR-7)
    credit_score INTEGER DEFAULT 0,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    eligible BOOLEAN DEFAULT FALSE,
    
    -- Compliance (FR-8)
    tax_compliant BOOLEAN DEFAULT FALSE,
    license_valid BOOLEAN DEFAULT FALSE,
    license_expiry DATE,
    
    funded_amount NUMERIC DEFAULT 0,
    employees INTEGER DEFAULT 0,
    pool_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial statements uploads
CREATE TABLE sme_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sme_id UUID REFERENCES smes(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'financial_statement', 'compliance_doc', 'certificate'
    file_url TEXT NOT NULL,
    file_name TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash flow projections
CREATE TABLE cash_flow_projections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sme_id UUID REFERENCES smes(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    projected_amount NUMERIC NOT NULL,
    actual_amount NUMERIC
);

-- ============================================
-- 3. SME POOLS & BOND STRUCTURING (FR-9, FR-10)
-- ============================================
CREATE TABLE pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    total_exposure NUMERIC DEFAULT 0,
    avg_credit_score NUMERIC DEFAULT 0,
    coupon_rate NUMERIC DEFAULT 0,
    maturity_months INTEGER DEFAULT 24,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'matured')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link SMEs to pools
ALTER TABLE smes ADD CONSTRAINT fk_pool FOREIGN KEY (pool_id) REFERENCES pools(id);

CREATE TABLE tranches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('senior', 'mezzanine', 'junior')),
    allocation_pct NUMERIC NOT NULL,
    coupon_rate NUMERIC NOT NULL,
    expected_yield NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    subscribed NUMERIC DEFAULT 0,
    risk TEXT CHECK (risk IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INVESTORS (FR-13, FR-14, FR-15)
-- ============================================
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    type TEXT, -- 'pension_fund', 'asset_manager', 'bank', 'insurance'
    mandate TEXT,
    risk_appetite TEXT CHECK (risk_appetite IN ('low', 'medium', 'high')),
    total_invested NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID REFERENCES investors(id),
    tranche_id UUID REFERENCES tranches(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PAYMENTS & SETTLEMENT (FR-17, FR-18, FR-19)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('disbursement', 'repayment', 'investor_payout')),
    reference TEXT UNIQUE NOT NULL,
    sme_id UUID REFERENCES smes(id),
    investor_id UUID REFERENCES investors(id),
    tranche_id UUID REFERENCES tranches(id),
    amount NUMERIC NOT NULL,
    scheduled_amount NUMERIC,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'late', 'failed')),
    days_late INTEGER DEFAULT 0,
    penalty_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. AUDIT LOG (FR-20, NFR-8)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable: prevent updates and deletes (NFR-8)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ============================================
-- 7. NOTIFICATIONS (FR-26)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. SYSTEM CONFIGURATION (FR-25)
-- ============================================
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_config (key, value) VALUES
    ('risk_thresholds', '{"low": 70, "medium": 40}'),
    ('interest_benchmark', '7.5'),
    ('pool_limits', '{"min_size": 5, "max_size": 50, "max_exposure": 50000000}'),
    ('penalty_rate', '2.5');

-- ============================================
-- ROW LEVEL SECURITY (FR-4, NFR-7)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE smes ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SME users can only see their own data
CREATE POLICY sme_own_data ON smes
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        OR user_id = auth.uid()
    );

-- Investors can view pools and tranches
CREATE POLICY investor_view_pools ON pools
    FOR SELECT USING (true);

CREATE POLICY investor_view_tranches ON tranches
    FOR SELECT USING (true);

-- Regulators can view compliance reports
CREATE POLICY regulator_view_all ON smes
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('regulator', 'admin')
    );

-- Admin full access
CREATE POLICY admin_full_access ON users
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================
-- INDEXES FOR PERFORMANCE (NFR-1)
-- ============================================
CREATE INDEX idx_smes_status ON smes(status);
CREATE INDEX idx_smes_risk ON smes(risk_level);
CREATE INDEX idx_smes_pool ON smes(pool_id);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_subscriptions_investor ON subscriptions(investor_id);
CREATE INDEX idx_tranches_pool ON tranches(pool_id);
