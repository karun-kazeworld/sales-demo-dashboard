# Sales Performance Dashboard

## 🎯 Project Status: ✅ LIVE IN PRODUCTION
**🌐 Live URL:** https://sales-performance-dashboard-opal.vercel.app  
**Live Supabase Integration** | **Real Authentication** | **Cloud Database** | **Auto-Deploy**

A multi-tenant React TypeScript dashboard for sales conversation analysis with role-based access control. Supports multiple domains (Automotive/Banking) with dynamic schema rendering and real-time analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Setup
```bash
# Clone and install dependencies
git clone https://github.com/karun-kazeworld/sales-demo-dashboard.git
cd sales-demo-dashboard
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🌐 Live Application
- **Production URL:** https://sales-performance-dashboard-opal.vercel.app
- **Repository:** https://github.com/karun-kazeworld/sales-demo-dashboard
- **Auto-Deploy:** ✅ Enabled (deploys on every GitHub push)

## 🔐 Demo Accounts

Login with these test accounts on the live site:

- **Automotive Executive:** `castrol.executive@demo.com`
- **Automotive Supervisor:** `automotive.supervisor@demo.com`  
- **Banking Executive:** `sbi.executive@demo.com`
- **Banking Supervisor:** `banking.supervisor@demo.com`

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Hosting:** Vercel (Serverless)
- **Charts:** Chart.js + React-Chartjs-2
- **State:** React Context + Custom Hooks
- **Routing:** React Router v6

### Key Features
- ✅ **Multi-tenant Architecture** - Automotive (Castrol) & Banking (SBI) domains
- ✅ **Role-based Dashboards** - Executive personal view, Supervisor team analytics  
- ✅ **Dynamic Schema Support** - Different scoring structures per product
- ✅ **Real-time Data** - Live conversation analysis and scoring
- ✅ **Persistent Sessions** - No logout on page refresh
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Production Ready** - Live deployment with auto-updates

## 📊 Dashboard Views

### Executive Dashboard
- Personal conversation history
- Individual performance metrics  
- Score breakdowns by dimension/subscore
- Compliance status tracking

### Supervisor Dashboard  
- Team performance overview
- Individual executive drill-down
- Comparative analytics
- Domain-specific insights

## 🗄️ Database Schema

### Products
- **Castrol CRB Turbomax** (Automotive) - Multi-dimensional scoring (0-5 scale)
- **SBI Life Smart Annuity Plus** (Banking) - Subscore structure (0-100 scale)

### User Roles
- **Executive** - Views own conversations only
- **Supervisor** - Views team conversations + analytics
- **Admin** - Full system access + data management

### Sample Data
- 4 conversations with real analysis results
- 2 products with different scoring schemas
- 5 user profiles across domains

## 🔧 Development

### Available Scripts
- `npm start` - Development server
- `npm test` - Run test suite  
- `npm run build` - Production build
- `npm run eject` - Eject from Create React App

### Project Structure
```
src/
├── components/
│   ├── auth/LoginForm.tsx
│   └── dashboard/
│       ├── ExecutiveDashboard.tsx
│       └── SupervisorDashboard.tsx
├── contexts/AuthContext.tsx
├── services/supabase.ts
├── types/database.ts
└── App.tsx
```

## 📈 Next Steps

1. Add conversation filtering and search functionality
2. Implement export functionality for analytics
3. Add real-time notifications for new conversations
4. Expand to additional domains beyond Automotive/Banking
5. Add custom domain (optional)
6. Implement analytics tracking

## 📚 Documentation

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Complete deployment setup guide
- **[CONTEXT_DOCUMENT_FOR_AI.md](./CONTEXT_DOCUMENT_FOR_AI.md)** - Technical context for AI assistants

## 🤝 Contributing

This is a demo project showcasing multi-tenant dashboard architecture with Supabase integration.

---

**🌐 Live Application:** https://sales-performance-dashboard-opal.vercel.app  
**Built with React + TypeScript + Supabase + Vercel**  
*Production deployment ready with auto-updates*
