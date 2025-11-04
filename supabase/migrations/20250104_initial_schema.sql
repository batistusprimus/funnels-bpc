-- ============================================
-- BPC FUNNELS - Initial Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: funnels
-- Stocke la configuration complète de chaque funnel
-- ============================================
CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par slug
CREATE INDEX idx_funnels_slug ON funnels(slug);
CREATE INDEX idx_funnels_status ON funnels(status);

-- ============================================
-- TABLE: leads
-- Stocke tous les leads collectés
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b', 'c')),
  data JSONB NOT NULL DEFAULT '{}',
  utm_params JSONB DEFAULT '{}',
  sent_to TEXT,
  sent_to_client TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'error')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_leads_funnel ON leads(funnel_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_variant ON leads(variant);

-- ============================================
-- TABLE: routing_rules
-- Règles de routage conditionnel des leads
-- ============================================
CREATE TABLE routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  condition JSONB NOT NULL,
  webhook_url TEXT NOT NULL,
  client_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour tri par priorité
CREATE INDEX idx_routing_funnel_priority ON routing_rules(funnel_id, priority);

-- ============================================
-- TABLE: analytics_events
-- Tracking des événements pour analytics détaillées
-- ============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  variant TEXT CHECK (variant IN ('a', 'b', 'c')),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'form_start', 'step_complete', 'form_submit', 'lead_sent')),
  data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_funnel_event ON analytics_events(funnel_id, event_type, created_at DESC);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_funnels_updated_at 
BEFORE UPDATE ON funnels
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- Pour le moment désactivé car mono-utilisateur
-- À activer lors du passage multi-tenant
-- ============================================

-- ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Politique d'accès (à décommenter lors du passage multi-tenant)
-- CREATE POLICY "Users can view their own funnels" ON funnels
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create their own funnels" ON funnels
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own funnels" ON funnels
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own funnels" ON funnels
--   FOR DELETE USING (auth.uid() = user_id);

