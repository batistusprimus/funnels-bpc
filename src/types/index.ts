// Types globaux pour BPC Funnels

export type FunnelStatus = 'draft' | 'active' | 'archived';
export type LeadStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'error';
export type VariantKey = 'a' | 'b' | 'c';
export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea';
export type ConditionOperator = '>' | '>=' | '<' | '<=' | '==' | '!=' | 'contains' | 'startsWith' | 'endsWith';
export type AnalyticsEventType = 'page_view' | 'form_start' | 'step_complete' | 'form_submit' | 'lead_sent';
export type TeamRole = 'owner' | 'editor' | 'viewer';
export type TeamMemberStatus = 'pending' | 'active' | 'suspended';

// Field Configuration
export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

// Step Configuration
export interface StepConfig {
  id: string;
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  nextStep: string | null;
}

// Theme Configuration
export interface ThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
}

// CTA Configuration
export interface CTAConfig {
  text: string;
  href: string;
}

// Landing Configuration
export interface LandingConfig {
  title: string;
  subtitle: string;
  cta: CTAConfig;
  image?: string;
  theme?: ThemeConfig;
}

// Thank You Configuration
export interface ThankYouConfig {
  title: string;
  message: string;
  cta?: CTAConfig | null;
}

// Variant Configuration
export interface VariantConfig {
  key: VariantKey;
  weight: number;
  landing: LandingConfig;
  steps: StepConfig[];
  thankYou: ThankYouConfig;
}

// Tracking Configuration
export interface TrackingConfig {
  metaPixelId?: string;
  ga4Id?: string;
  gtmId?: string;
}

// Funnel Configuration (JSONB)
export interface FunnelConfig {
  tracking?: TrackingConfig;
  variants: VariantConfig[];
}

// Database Tables

export interface Funnel {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  description: string | null;
  status: FunnelStatus;
  config: FunnelConfig;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  funnel_id: string;
  variant: VariantKey;
  data: Record<string, any>;
  utm_params: Record<string, any>;
  sent_to: string | null;
  sent_to_client: string | null;
  status: LeadStatus;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  funnels?: Pick<Funnel, 'id' | 'name' | 'slug'>;
}

export interface RoutingCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface RoutingRule {
  id: string;
  funnel_id: string;
  priority: number;
  condition: RoutingCondition;
  webhook_url: string;
  client_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  funnel_id: string;
  variant: VariantKey | null;
  event_type: AnalyticsEventType;
  data: Record<string, any>;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

// Team Collaboration Types
export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  role: TeamRole;
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
  status: TeamMemberStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email?: string;
  action: string;
  entity_type: 'funnel' | 'lead' | 'routing_rule' | 'team_member';
  entity_id: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// API Request/Response Types

export interface CreateFunnelRequest {
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  tracking?: TrackingConfig;
  template?: 'simple' | 'storytelling' | 'quiz' | 'blank';
}

export interface SubmitLeadRequest {
  funnelId: string;
  variant: VariantKey;
  data: Record<string, any>;
  utmParams?: Record<string, any>;
}

export interface LeadRouteResult {
  success: boolean;
  client?: string;
  error?: string;
}

// UI Types

export interface FunnelCardData {
  funnel: Funnel;
  stats: {
    leads: number;
    conversion: number;
    avgValue: number;
  };
}

export interface FunnelAnalytics {
  visitors: number;
  leads: number;
  conversion: number;
  sent: number;
  variantStats: {
    variant: VariantKey;
    traffic: number;
    leads: number;
    conversion: number;
  }[];
  clientStats: {
    client: string;
    leads: number;
    percentage: number;
  }[];
}
