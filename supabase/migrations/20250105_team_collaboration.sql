-- ============================================
-- BPC FUNNELS - Team Collaboration
-- Migration pour support multi-utilisateurs
-- ============================================

-- Table: team_members
-- Gestion des membres d'équipe et permissions
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_email ON team_members(email);

-- Table: activity_log
-- Log de toutes les actions dans l'application
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('funnel', 'lead', 'routing_rule', 'team_member')),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id, created_at DESC);

-- Trigger pour activity log automatique
CREATE OR REPLACE FUNCTION log_funnel_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (action, entity_type, entity_id, metadata)
    VALUES ('funnel.created', 'funnel', NEW.id, jsonb_build_object('name', NEW.name));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (action, entity_type, entity_id, metadata)
    VALUES ('funnel.updated', 'funnel', NEW.id, jsonb_build_object('name', NEW.name));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (action, entity_type, entity_id, metadata)
    VALUES ('funnel.deleted', 'funnel', OLD.id, jsonb_build_object('name', OLD.name));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER funnel_activity_log
AFTER INSERT OR UPDATE OR DELETE ON funnels
FOR EACH ROW EXECUTE FUNCTION log_funnel_changes();

-- Trigger pour updated_at
CREATE TRIGGER update_team_members_updated_at 
BEFORE UPDATE ON team_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction helper : vérifier permission
CREATE OR REPLACE FUNCTION user_can_edit_funnel(funnel_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Pour l'instant, tous les users authentifiés peuvent éditer
  -- À modifier lors de l'activation du multi-tenant
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Vue : team members avec user info
CREATE VIEW team_members_with_users AS
SELECT 
  tm.*,
  u.email as user_email,
  u.created_at as user_created_at
FROM team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id;

-- Fonction : get team activity
CREATE OR REPLACE FUNCTION get_team_activity(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    u.email as user_email,
    al.action,
    al.entity_type,
    al.entity_id,
    al.metadata,
    al.created_at
  FROM activity_log al
  LEFT JOIN auth.users u ON al.user_id = u.id
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

