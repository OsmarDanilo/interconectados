import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentProducts();
    }, []);

    const fetchRecentProducts = async () => {
        try {
            const response = await api.get('/products', { params: { limit: 6 } });
            setRecentProducts(response.data.products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = { telemovel: '📱', laptop: '💻', console: '🎮', tablet: '📟' };
        return icons[category] || '📦';
    };

    return (
        <div>
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 mb-8">
                <h1 className="text-2xl font-bold mb-2">Olá, {user?.name}!</h1>
                <p className="opacity-90">Bem-vindo ao seu painel de comprador</p>
            </div>

            <h2 className="text-xl font-bold mb-4">Produtos em Destaque</h2>
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : recentProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500">Nenhum produto disponível.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {recentProducts.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} className="block">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                <div className="h-40 bg-gray-100 flex items-center justify-center">
                                    {product.photos && product.photos[0] ? (
                                        <img src={`http://localhost:3001${product.photos[0]}`} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{product.title}</h3>
                                    <p className="text-lg font-bold text-primary-600 mb-2">{product.price.toLocaleString()} Kz</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>👤 {product.sellerName}</span>
                                        <span>📍 {product.location}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas para compradores</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Sempre verifique a reputação do vendedor antes de comprar</li>
                    <li>• Entre em contato pelo WhatsApp ou ligação para tirar dúvidas</li>
                    <li>• Prefira encontros em locais públicos para realizar a troca</li>
                    <li>• Teste o produto antes de finalizar a compra</li>
                </ul>
            </div>
        </div>
    );
};

export default BuyerDashboard;