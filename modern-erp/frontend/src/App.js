import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RawMaterials from './pages/RawMaterials';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import BOMManagement from './pages/BOMManagement';
import PurchaseRequisitions from './pages/PurchaseRequisitions';
import ProductionPlanning from './pages/ProductionPlanning';
import QualityControl from './pages/QualityControl';
import DrugRegistration from './pages/DrugRegistration';
import LetterOfCredit from './pages/LetterOfCredit';
import Reports from './pages/Reports';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
// New Enhanced Components
import ProductCategories from './components/ProductCategories';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box>Loading...</Box>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/raw-materials" element={<RawMaterials />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product-categories" element={<ProductCategories />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/bom" element={<BOMManagement />} />
                    <Route path="/procurement" element={<PurchaseRequisitions />} />
                    <Route path="/production" element={<ProductionPlanning />} />
                    <Route path="/quality" element={<QualityControl />} />
                    <Route path="/drugs" element={<DrugRegistration />} />
                    <Route path="/lc" element={<LetterOfCredit />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/employees" element={<Employees />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
