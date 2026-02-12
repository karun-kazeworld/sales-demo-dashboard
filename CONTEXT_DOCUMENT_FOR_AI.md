# AI Assistant Context Document

## Project: Sales Performance Dashboard

### CRITICAL CONTEXT FOR AI ASSISTANT
This document provides complete context for AI assistants working on this React TypeScript dashboard project. Read this first to understand the current state, architecture, and recent changes.

## PROJECT STATUS: ✅ PRODUCTION READY

### What This Project Is:
- **Multi-tenant sales conversation analytics dashboard**
- **Role-based access**: Admin, Supervisor, Executive
- **Two domains**: Automotive (Castrol) and Banking (SBI)
- **Different scoring schemas**: Multi-dimensional vs Subscore structures
- **Real Supabase backend** with authentication and real-time capabilities

### Current Working State:
- ✅ **All dashboards functional**: SupervisorDashboard, AdminDashboard, ExecutiveDashboard
- ✅ **Authentication working**: Role-based routing with persistent sessions
- ✅ **Status badges working**: Both automotive and banking domains
- ✅ **Conversation modals working**: Score display, evidence, recommendations
- ✅ **Responsive design**: Mobile and desktop layouts
- ✅ **Multi-schema support**: Banking (percentage) and Automotive (dimensional)

## RECENT CRITICAL FIXES (February 2026)

### Status Badge Issues - ALL RESOLVED ✅
**Problem**: Status badges had multiple display issues
**Solutions Applied**:
1. **Duplicate Status**: Removed from modal headers, kept below Overall Score
2. **Missing Automotive Status**: Added status badge to multi_dimension structure in UniversalScoreDisplay
3. **Status Extraction**: Implemented `conversation.status || conversation.analysis_result?.compliance?.status`
4. **Column Width**: Fixed AdminDashboard status column (80px → 140px)

### Login Page Enhancement ✅
- Changed "Demo Credentials" → "Demo Emails to login"
- Removed "Passwords configured in Supabase DB" line

## ARCHITECTURE FOR AI UNDERSTANDING

### Key Components:
```
src/components/
├── auth/LoginForm.tsx                    # Authentication with demo accounts
├── dashboard/
│   ├── SupervisorDashboard.tsx          # Team analytics + conversation modals
│   ├── AdminDashboard.tsx               # Cross-domain access
│   └── ExecutiveDashboard.tsx           # Personal performance view
└── analysis/UniversalScoreDisplay.tsx   # Multi-schema score rendering
```

### Data Flow:
1. **Authentication**: Supabase Auth → Role-based routing
2. **Data Fetching**: Custom hooks (useConversations, useProducts)
3. **Status Display**: DB column primary → analysis_result fallback
4. **Score Rendering**: Schema-aware (banking % vs automotive dimensions)

### Database Schema:
- **conversations.status** (TEXT) - Primary status source
- **conversations.analysis_result** (JSONB) - Fallback + score data
- **products** - Schema definitions for different scoring structures
- **user_profiles** - Role and domain assignments

## CRITICAL CODE PATTERNS FOR AI

### Status Extraction Pattern:
```javascript
complianceStatus={conversation.status || conversation.analysis_result?.compliance?.status}
```

### Multi-Schema Score Display:
- **Banking**: `schema.score_structure === 'subscore'` → Percentage display
- **Automotive**: `schema.score_structure === 'multi_dimension'` → Dimensional display

### Modal Structure:
- Header: Product name + Date (NO status badge)
- Body: UniversalScoreDisplay with status badge below Overall Score
- Sections: Evidence + Recommendations

## DEMO ACCOUNTS FOR TESTING:
- `castrol.executive@demo.com` (Automotive Executive)
- `automotive.supervisor@demo.com` (Automotive Supervisor)
- `sbi.executive@demo.com` (Banking Executive)
- `banking.supervisor@demo.com` (Banking Supervisor)

## CURRENT ISSUES: NONE ✅
All previously reported issues have been resolved:
- ✅ Status badges display correctly for both domains
- ✅ Modal layouts are clean and consistent
- ✅ Column widths are uniform across dashboards
- ✅ Login page has clear messaging

## WHEN WORKING ON THIS PROJECT:

### Always Remember:
1. **Two Domain Types**: Automotive and Banking have different data structures
2. **Status Fallback**: Always use DB column first, then analysis_result
3. **Schema Awareness**: Check score_structure before rendering scores
4. **Responsive Design**: Test both mobile and desktop layouts
5. **Role-Based Access**: Respect user permissions and domain restrictions

### Common Tasks:
- **Adding Features**: Follow existing patterns in dashboard components
- **Status Issues**: Check both DB column and analysis_result.compliance.status
- **Score Display**: Use UniversalScoreDisplay for schema-aware rendering
- **Modal Changes**: Modify UniversalScoreDisplay, not individual dashboards

### File Locations:
- **Status Logic**: UniversalScoreDisplay.tsx (line ~148)
- **Modal Structure**: Each dashboard's selectedConversation section
- **Authentication**: LoginForm.tsx + AuthContext.tsx
- **Data Fetching**: hooks/useConversations.ts, hooks/useProducts.ts

## DEPLOYMENT READY:
- ✅ All features working
- ✅ Production build tested
- ✅ Environment variables configured
- ✅ Supabase integration complete
- ✅ Ready for AWS deployment

---
*This document provides complete context for AI assistants. The project is fully functional and production-ready.*
