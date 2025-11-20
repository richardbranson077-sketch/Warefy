# 🚀 Warefy - AI-Powered Supply Chain Optimizer

An intelligent supply chain management platform featuring demand forecasting, route optimization, and AI-driven recommendations.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## ✨ Features

- 📊 **Demand Forecasting** - Prophet, LSTM & XGBoost models for accurate predictions
- 🗺️ **Route Optimization** - Google OR-Tools for efficient delivery routing  
- 🤖 **AI Recommendations** - GPT-4 powered insights for inventory & supply chain decisions
- ⚠️ **Anomaly Detection** - Isolation Forest algorithm to identify supply chain disruptions
- 📱 **Mobile API** - Dedicated endpoints for driver mobile apps
- 🏢 **Multi-Warehouse** - Manage inventory across multiple locations
- 🚚 **Fleet Management** - Track vehicles, routes, and deliveries
- 📈 **Real-time Analytics** - Live dashboards with WebSocket updates

## 🏗️ Tech Stack

**Backend**
- FastAPI (Python 3.11)
- PostgreSQL with PostGIS
- SQLAlchemy ORM
- JWT Authentication

**Frontend**
- Next.js 14 (App Router)
- TailwindCSS
- Recharts for data visualization
- Mapbox for route visualization

**ML/AI**
- Facebook Prophet
- TensorFlow (LSTM)
- XGBoost
- Google OR-Tools
- OpenAI GPT-4
- scikit-learn (Isolation Forest)

## 🚀 Deployment

### Railway (Recommended)
See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for step-by-step deployment instructions.

Quick summary:
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy Warefy"
git push origin main

# 2. Deploy on Railway
# - Visit railway.app
# - Connect GitHub repo
# - Add PostgreSQL database
# - Deploy!
```

### Local Development (Requires 10GB+ free disk space)
```bash
# With Docker
docker compose up -d

# Manual setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```

## 📚 Documentation

- **API Docs**: `/docs` (Swagger UI)
- **Deployment**: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
- **Walkthrough**: See artifacts directory
- **Status**: [STATUS.md](./STATUS.md)

## 🔐 Default Credentials

```
Username: admin
Password: admin123
```

**⚠️ Change these in production!**

## 🌍 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-... (optional)
MAPBOX_API_KEY=pk.... (optional)
```

## 📊 Project Structure

```
warefy/
├── backend/              # FastAPI application
│   ├── models/          # Database models
│   ├── routers/         # API endpoints
│   ├── main.py          # Application entry
│   └── seed_data.py     # Sample data
├── frontend/            # Next.js dashboard
│   ├── app/            # Pages & layouts
│   ├── components/     # React components
│   └── lib/            # API client
├── ml-pipelines/       # ML models & training
├── ai-module/          # GPT-4 integration
└── mobile-api/         # Driver mobile endpoints
```

## 🤝 Contributing

This is a portfolio/demonstration project. Feel free to fork and modify for your own use.

## 📝 License

MIT License - feel free to use this code for your projects!

## 🎯 Roadmap

- [x] Core inventory management
- [x] Demand forecasting (3 models)
- [x] Route optimization
- [x] AI recommendations
- [x] Anomaly detection
- [ ] ERP integration (SAP, Oracle, Odoo)
- [ ] Predictive maintenance (ML model ready)
- [ ] What-if scenario simulation
- [ ] Carbon footprint tracking

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using FastAPI, Next.js, and AI
