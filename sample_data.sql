-- Insert products with real data
INSERT INTO products (product, domain, brand, schema_definition, ui_config) VALUES
('Castrol CRB Turbomax', 'Automotive', 'castrol', '{
  "score_structure": "multi_dimension",
  "dimensions": ["business_understanding", "product_fit", "objection_handling", "closing_technique", "compliance", "relationship_building", "technical_accuracy"],
  "scale": [0, 5],
  "has_photo_analysis": true,
  "product_details": {
    "category": "Commercial Vehicle Engine Oil",
    "customer_type": "B2B Fleet Operators",
    "approved_benefits": ["engine protection under heavy loads", "reliable long-haul performance", "reduced engine wear"],
    "disallowed_claims": ["mileage improvement", "fuel savings", "engine life guarantees"]
  }
}', '{
  "charts": ["radar", "gauge", "bar"],
  "colors": {"primary": "#E31E24", "secondary": "#FFA500"},
  "dashboard_layout": "executive_supervisor"
}'),
('SBI Life Smart Annuity Plus', 'Banking', 'sbi', '{
  "score_structure": "subscore",
  "subscores": ["regulatory_compliance", "product_explanation", "customer_suitability"],
  "scale": [0, 100],
  "has_photo_analysis": false,
  "product_details": {
    "uin": "111N134V10",
    "category": "Annuity Plan, Pension Plan",
    "customer_type": "End Customer",
    "primary_benefit": "Guaranteed periodic income for life or defined period",
    "key_variations": ["life only", "life with return of purchase price", "joint life", "increasing annuity"],
    "limitations": "Generally no maturity value; death benefits depend on selected option",
    "regulatory_body": "IRDAI"
  }
}', '{
  "charts": ["gauge", "timeline", "compliance_status"],
  "colors": {"primary": "#1f4e79", "secondary": "#87CEEB"},
  "dashboard_layout": "compliance_focused"
}');

-- Insert demo users (password: password123, hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO users (id, email, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440002', 'automotive.supervisor@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440003', 'banking.supervisor@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440004', 'castrol.executive@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440005', 'sbi.executive@demo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert user profiles with domain hierarchy
INSERT INTO user_profiles (id, email, role, domain, supervisor_id) VALUES
-- Admin (access to all domains)
('550e8400-e29b-41d4-a716-446655440001', 'admin@demo.com', 'admin', NULL, NULL),

-- Domain Supervisors
('550e8400-e29b-41d4-a716-446655440002', 'automotive.supervisor@demo.com', 'supervisor', 'Automotive', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'banking.supervisor@demo.com', 'supervisor', 'Banking', NULL),

-- Executives under domain supervisors
('550e8400-e29b-41d4-a716-446655440004', 'castrol.executive@demo.com', 'executive', 'Automotive', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440005', 'sbi.executive@demo.com', 'executive', 'Banking', '550e8400-e29b-41d4-a716-446655440003');

-- Update conversations to use domain-specific executives
INSERT INTO conversations (product_id, executive_id, transcript, conversation_timestamp, analysis_result, total_score, compliance_status, metadata) 
SELECT 
  p.id as product_id,
  CASE 
    WHEN p.domain = 'Automotive' THEN '550e8400-e29b-41d4-a716-446655440004'  -- castrol.executive
    WHEN p.domain = 'Banking' THEN '550e8400-e29b-41d4-a716-446655440005'     -- sbi.executive
  END as executive_id,
  CASE 
    WHEN p.brand = 'castrol' THEN 'Salesperson: Good morning! I understand you operate a fleet of trucks for long-haul routes. I''m here to discuss Castrol CRB Turbomax engine oil.

Customer: Yes, we have about 50 trucks running mostly interstate routes. Our main concerns are oil costs and minimizing downtime. We''re currently using a competitor''s product.

Salesperson: I completely understand those concerns. Castrol CRB Turbomax is specifically designed for heavy load operations like yours. It provides excellent engine protection under heavy loads, which is crucial for long-haul trucking.

Customer: What about cost? We need to keep our operating expenses down.

Salesperson: While I can''t guarantee specific fuel savings, CRB Turbomax does offer reliable performance for long-haul operations and helps reduce engine wear. This means potentially fewer maintenance issues and longer intervals between services.

Customer: That sounds good. What about credit terms?

Salesperson: We can definitely work with you on flexible payment terms. Let me connect you with our fleet solutions team to discuss bulk pricing and credit arrangements that work for your cash flow.

Customer: Okay, I''d like to see some technical specifications and get a quote for our fleet.'
    WHEN p.brand = 'sbi' THEN 'Salesperson: Good afternoon! I understand you''re looking into retirement planning options. Let me tell you about SBI Life Smart Annuity Plus.

Customer: Yes, I''m 45 and want to ensure regular income after retirement. I''ve heard about annuities but need to understand the options.

Salesperson: SBI Life Smart Annuity Plus, UIN 111N134V10, is an annuity plan that provides guaranteed periodic income for life or a defined period, depending on the option you choose.

Customer: What are my options?

Salesperson: You have several annuity options: life only, life with return of purchase price, joint life, and increasing annuity. Each has different income levels and death benefit rules as per IRDAI regulations.

Customer: What about maturity benefits?

Salesperson: I need to be clear about this - there''s generally no maturity value with this product. The death benefits and liquidity depend strictly on the selected option, as governed by the policy wording and IRDAI regulations.

Customer: What about tax benefits?

Salesperson: Tax treatment is governed by current tax laws and IRDAI regulations. I''ll provide you with the detailed policy document that explains all tax implications. I cannot make specific tax benefit claims without proper documentation.

Customer: I appreciate your honesty. Can I get the policy details to review?'
  END as transcript,
  CASE 
    WHEN p.brand = 'castrol' THEN '2026-02-05 14:30:00+00'::timestamp with time zone
    WHEN p.brand = 'sbi' THEN '2026-02-05 15:45:00+00'::timestamp with time zone
  END as conversation_timestamp,
  CASE 
    WHEN p.brand = 'castrol' THEN '{
      "total_score": 4.2,
      "scores": {
        "business_understanding": 4.5,
        "product_fit": 4.3,
        "objection_handling": 4.0,
        "closing_technique": 3.8,
        "compliance": 4.8,
        "relationship_building": 4.2,
        "technical_accuracy": 4.1
      },
      "compliance_status": "pass",
      "evidence_quotes": [
        {"quote": "Castrol CRB Turbomax is specifically designed for heavy load operations", "speaker": "salesperson", "timestamp": "00:02:45", "dimension": "product_fit"},
        {"quote": "We have about 50 trucks running mostly interstate routes", "speaker": "customer", "timestamp": "00:01:20", "dimension": "business_understanding"},
        {"quote": "While I cant guarantee specific fuel savings", "speaker": "salesperson", "timestamp": "00:04:15", "dimension": "compliance"},
        {"quote": "Let me connect you with our fleet solutions team", "speaker": "salesperson", "timestamp": "00:05:30", "dimension": "closing_technique"}
      ],
      "recommendations": [
        "Follow up with technical specifications as requested",
        "Coordinate with fleet solutions team for bulk pricing",
        "Schedule site visit to assess current maintenance practices",
        "Provide case studies from similar fleet operations"
      ],
      "compliance_notes": "Correctly avoided fuel savings guarantees. Properly positioned approved benefits only."
    }'::jsonb
    WHEN p.brand = 'sbi' THEN '{
      "total_score": 82,
      "subscores": {
        "regulatory_compliance": 88,
        "product_explanation": 78,
        "customer_suitability": 80
      },
      "compliance_status": "pass",
      "evidence_quotes": [
        {"quote": "SBI Life Smart Annuity Plus, UIN 111N134V10", "speaker": "salesperson", "timestamp": "00:02:10", "compliance_area": "product_identification"},
        {"quote": "theres generally no maturity value with this product", "speaker": "salesperson", "timestamp": "00:04:45", "compliance_area": "limitation_disclosure"},
        {"quote": "as governed by the policy wording and IRDAI regulations", "speaker": "salesperson", "timestamp": "00:05:20", "compliance_area": "regulatory_reference"},
        {"quote": "I cannot make specific tax benefit claims without proper documentation", "speaker": "salesperson", "timestamp": "00:06:15", "compliance_area": "tax_compliance"}
      ],
      "recommendations": [
        "Provide detailed policy document as promised",
        "Schedule follow-up to explain annuity options in detail",
        "Prepare comparison chart of different annuity options",
        "Arrange meeting with tax advisor if customer requests"
      ],
      "compliance_notes": "Excellent regulatory compliance. Properly disclosed limitations and avoided unsupported tax claims.",
      "violations": [],
      "strengths": [
        "Clear product identification with UIN",
        "Honest disclosure of limitations",
        "Proper regulatory references",
        "Avoided making unsupported claims"
      ]
    }'::jsonb
  END as analysis_result,
  CASE 
    WHEN p.brand = 'castrol' THEN 4.2
    WHEN p.brand = 'sbi' THEN 82
  END as total_score,
  'pass' as compliance_status,
  CASE 
    WHEN p.brand = 'castrol' THEN '{"duration_minutes": 18, "customer_type": "fleet_operator", "fleet_size": 50, "route_type": "long_haul", "current_supplier": "competitor"}'::jsonb
    WHEN p.brand = 'sbi' THEN '{"duration_minutes": 25, "customer_type": "individual", "age": 45, "retirement_goal": "regular_income", "risk_profile": "conservative"}'::jsonb
  END as metadata
FROM products p;
