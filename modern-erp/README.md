# Pharma P2P ERP System

A modern Pharmaceutical Procure-to-Pay ERP system built with FastAPI (backend) and React with Chakra UI (frontend).

## Overview

This is a complete modernization of the original Oracle Forms-based pharmaceutical ERP system. The new system maintains all the original business logic while providing a modern, responsive web interface and API-driven architecture.

## Features

### Core Modules
- **Raw Materials Management** - Manage raw material inventory, specifications, and suppliers
- **Product Management** - Handle finished product catalog and formulations
- **Supplier Management** - Maintain supplier information and relationships
- **Bill of Materials (BOM)** - Create and manage product formulations
- **Procurement** - Purchase requisitions and order management
- **Production Planning** - Batch planning and scheduling
- **Quality Control** - QC test management and specifications
- **Drug Registration** - Regulatory submission tracking
- **Letter of Credit** - Import/export financial instruments
- **Reports & Analytics** - Comprehensive reporting dashboard

### Technical Features
- Modern REST API with FastAPI
- React frontend with Chakra UI components
- PostgreSQL database with SQLAlchemy ORM
- Docker containerization for easy deployment
- JWT-based authentication
- Real-time data with React Query
- Responsive design for all devices

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PostgreSQL** - Advanced open-source database
- **Redis** - In-memory data structure store
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Tokens for authentication

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **Chakra UI** - Simple, modular and accessible component library
- **React Query** - Data fetching and state management
- **React Router** - Declarative routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Performant forms with easy validation

### Infrastructure
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker applications

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git for cloning the repository

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd modern-erp
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Create your first user**
   - Navigate to http://localhost:3000
   - Click "Sign up" on the login page
   - Fill in your details to create an account
   - Log in with your new credentials

## Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Database Schema

The system uses a PostgreSQL database with the following main entities:

- **Users** - System users and authentication
- **Suppliers** - Supplier master data
- **RawMaterials** - Raw material catalog
- **Products** - Finished product catalog
- **BillOfMaterials** - Product formulations
- **PurchaseRequisitions** - Purchase requests
- **ProductionPlans** - Production scheduling
- **QualityControlTests** - QC specifications
- **DrugRegistrations** - Regulatory tracking
- **LetterOfCredits** - Import/export finance

## API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Business Logic Preservation

This modernization maintains 100% of the original business logic from the Oracle Forms system:

### Raw Materials
- Material specifications and versions
- Supplier relationships
- Quality standards and testing

### Production
- Batch planning and scheduling
- Material requirement planning (MRP)
- Production order management

### Procurement
- Purchase requisition workflows
- Vendor management
- Purchase order processing

### Quality Control
- Test specifications by product/material
- QC result tracking
- Certificate of analysis

### Regulatory
- Drug registration tracking
- Regulatory submission management
- Compliance reporting

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/pharma_erp
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Production Deployment

For production deployment:

1. **Update environment variables** with production values
2. **Use production-grade database** (managed PostgreSQL)
3. **Configure SSL certificates** for HTTPS
4. **Set up reverse proxy** (nginx) for load balancing
5. **Configure monitoring** and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for endpoint details

## Migration from Legacy System

This system is designed to replace the original Oracle Forms-based ERP system. Data migration scripts and procedures are available for:

- Master data (suppliers, materials, products)
- Transaction data (orders, requisitions, plans)
- Historical data preservation
- User access migration

Contact the development team for migration assistance and planning.
