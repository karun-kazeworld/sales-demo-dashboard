// Database types
export interface Product {
  id: string;
  product: string;
  domain: string;
  brand: string;
  schema_definition: SchemaDefinition;
  ui_config: UIConfig;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'executive' | 'supervisor' | 'admin';
  domain?: string; // Domain assignment (Banking, Automotive, etc.)
  supervisor_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  product_id: string;
  executive_id: string;
  transcript: string;
  conversation_timestamp: string;
  analysis_result: AnalysisResult;
  total_score?: number;
  status?: string;
  metadata: Record<string, any>;
  created_at: string;
  // Joined fields
  products?: Product;
  user_profiles?: UserProfile;
}

export interface SchemaDefinition {
  score_structure: 'multi_dimension' | 'subscore';
  dimensions?: string[];
  subscores?: string[];
  scale: [number, number];
  has_photo_analysis: boolean;
}

export interface UIConfig {
  charts: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  dashboard_layout: string;
}

export interface AnalysisResult {
  // Castrol schema (multi_dimension)
  overall_rating?: {
    score_0_to_100: number;
    deal_readiness: string;
    executive_summary: string;
  };
  dimension_ratings?: Record<string, {
    score_0_to_5: number;
    evidence_quotes: string[];
    rationale: string;
  }>;
  what_went_well?: string[];
  accuracy_assessment?: any;
  qa_handling_detail?: any;
  compliance?: {
    status: string;
    violations: any[];
    overall_risk_level: string;
  };
  issues_and_risks?: any[];
  contradictions?: any[];
  rewrites?: any[];
  next_interaction_coaching?: any;

  // SBI schema (subscore)
  product?: string;
  score?: {
    total: number;
    subscores: Record<string, number>;
    grade: string;
  };
  highlights?: string[];
  issues?: any[];
  claims?: any[];
  qa?: any[];
  coach?: string[];
  next_meeting_coaching?: string[];

  // Legacy fields for backward compatibility
  total_score?: number;
  scores?: Record<string, number>;
  subscores?: Record<string, number>;
  status?: string;
  evidence_quotes?: EvidenceQuote[];
  recommendations?: string[];
  violations?: string[];
}

export interface EvidenceQuote {
  quote: string;
  timestamp?: string;
  speaker?: 'salesperson' | 'customer';
  confidence?: number;
}
