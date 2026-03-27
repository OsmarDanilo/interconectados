import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProduct from './pages/CreateProduct';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/create-product" element={user?.type === 'vendedor' ? <CreateProduct /> : <Navigate to="/" />} />
                    <Route path="/seller/dashboard" element={user?.type === 'vendedor' ? <SellerDashboard /> : <Navigate to="/" />} />
                    <Route path="/buyer/dashboard" element={user?.type === 'comprador' ? <BuyerDashboard /> : <Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
        </div>
    );
}

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;