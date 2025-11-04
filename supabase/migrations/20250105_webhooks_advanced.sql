-- ============================================
-- BPC FUNNELS - Advanced Webhooks System
-- ============================================

-- ============================================
-- TABLE: webhook_configs
-- Configuration avancée des webhooks avec custom headers
-- ============================================
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routing_rule_id UUID NOT NULL REFERENCES routing_rules(id) ON DELETE CASCADE,
  custom_headers JSONB DEFAULT '{}',
  timeout_ms INTEGER DEFAULT 10000,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_delay_ms INTEGER DEFAULT 1000,
  retry_backoff_multiplier DECIMAL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_configs_rule ON webhook_configs(routing_rule_id);

-- ============================================
-- TABLE: webhook_logs
-- Logs détaillés de tous les appels webhooks
-- ============================================
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  routing_rule_id UUID NOT NULL REFERENCES routing_rules(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  
  -- Request info
  request_headers JSONB DEFAULT '{}',
  request_body JSONB NOT NULL,
  
  -- Response info
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  
  -- Timing
  duration_ms INTEGER,
  
  -- Retry info
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 1,
  is_retry BOOLEAN DEFAULT false,
  parent_log_id UUID REFERENCES webhook_logs(id),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  error_type TEXT, -- 'timeout', 'network', 'http_error', 'invalid_response'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_lead ON webhook_logs(lead_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_rule ON webhook_logs(routing_rule_id);
CREATE INDEX idx_webhook_logs_parent ON webhook_logs(parent_log_id);

-- ============================================
-- TABLE: api_keys
-- API keys pour l'API REST v1
-- ============================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_hash TEXT UNIQUE NOT NULL,
  key_preview TEXT NOT NULL, -- ex: "bpc_...abc123"
  name TEXT NOT NULL,
  description TEXT,
  
  -- Permissions
  scopes JSONB NOT NULL DEFAULT '["read:leads", "write:leads", "read:webhooks"]',
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_requests INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- ============================================
-- TABLE: api_rate_limit_log
-- Tracking du rate limiting
-- ============================================
CREATE TABLE api_rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour cleanup automatique (garder seulement dernière heure)
CREATE INDEX idx_rate_limit_created ON api_rate_limit_log(created_at DESC);
CREATE INDEX idx_rate_limit_key_created ON api_rate_limit_log(api_key_id, created_at DESC);

-- ============================================
-- TABLE: webhook_queue
-- Queue pour les webhooks à envoyer/retry
-- ============================================
CREATE TABLE webhook_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  routing_rule_id UUID NOT NULL REFERENCES routing_rules(id) ON DELETE CASCADE,
  webhook_log_id UUID REFERENCES webhook_logs(id),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  
  attempt_number INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_queue_status ON webhook_queue(status, scheduled_at);
CREATE INDEX idx_webhook_queue_lead ON webhook_queue(lead_id);

-- ============================================
-- TRIGGERS: Auto-update
-- ============================================
CREATE TRIGGER update_webhook_configs_updated_at 
BEFORE UPDATE ON webhook_configs
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Cleanup old rate limit logs
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM api_rate_limit_log 
  WHERE created_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get webhook statistics
-- ============================================
CREATE OR REPLACE FUNCTION get_webhook_stats(
  p_routing_rule_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_calls BIGINT,
  success_calls BIGINT,
  failed_calls BIGINT,
  avg_duration_ms NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_calls,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as success_calls,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_calls,
    ROUND(AVG(duration_ms), 2) as avg_duration_ms,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as success_rate
  FROM webhook_logs
  WHERE routing_rule_id = p_routing_rule_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Initial data: Default webhook config for existing rules
-- ============================================
INSERT INTO webhook_configs (routing_rule_id)
SELECT id FROM routing_rules
ON CONFLICT DO NOTHING;

