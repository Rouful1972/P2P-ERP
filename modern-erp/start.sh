#!/bin/bash

echo "🚀 Starting Pharma P2P ERP System..."
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building and starting containers..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Pharma ERP System is now running!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🗄️ Database Info:"
echo "   Host: localhost:5432"
echo "   Database: pharma_erp"
echo "   Username: postgres"
echo "   Password: postgres123"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Click 'Sign up' to create your first user account"
echo "   3. Log in and start using the system"
echo ""
echo "🛑 To stop the system, run: docker-compose down"
