-- ============================================
-- BPC FUNNELS - Système de tags
-- Migration: 20250105_add_tags
-- ============================================

-- Ajouter la colonne tags aux funnels
ALTER TABLE funnels 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Index pour recherche rapide par tags
CREATE INDEX idx_funnels_tags ON funnels USING GIN(tags);

-- ============================================
-- TABLE: templates
-- Stocke les templates de funnels (marketplace)
-- ============================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  preview_image TEXT,
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = true;

-- Trigger auto-update pour templates
CREATE TRIGGER update_templates_updated_at 
BEFORE UPDATE ON templates
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

