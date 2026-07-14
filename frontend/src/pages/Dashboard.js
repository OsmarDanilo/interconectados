import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiEye, FiPlus } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalViews: 0 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products/seller/${user.id}`);
            setProducts(response.data.products);
            const totalViews = response.data.products.reduce((sum, p) => sum + (p.views || 0), 0);
            setStats({
                totalProducts: response.data.products.length,
                totalViews: totalViews
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Remover este anúncio?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Anúncio removido!');
            fetchProducts();
        } catch (error) {
            toast.error('Erro ao remover');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-8">
                <h1 className="text-2xl font-bold mb-2">Meu Painel</h1>
                <p className="opacity-90">Gerencie seus anúncios</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalProducts}</div>
                    <div className="text-gray-600">Total de Anúncios</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalViews}</div>
                    <div className="text-gray-600">Visualizações Totais</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Meus Anúncios</h2>
                <Link to="/create-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <FiPlus /> Novo Anúncio
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 mb-4">Você ainda não tem anúncios.</p>
                    <Link to="/create-product" className="text-blue-600 hover:underline">Criar meu primeiro anúncio</Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visualizações</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.photos && product.photos[0] ? (
                                                    <img 
                                                        src={product.photos[0]} 
                                                        alt={product.title} 
                                                        className="w-12 h-12 object-cover rounded-lg" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                                        {getCategoryIcon(product.category)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.title}</div>
                                                    <div className="text-sm text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-blue-600">{product.price.toLocaleString()} Kz</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getConditionClass(product.condition)}`}>
                                                {getConditionText(product.condition)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <FiEye size={14} />
                                                <span>{product.views || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Link to={`/product/${product.id}`} className="text-blue-600 hover:text-blue-800">
                                                    <FiEye size={18} />
                                                </Link>
                                                <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Funções auxiliares (copiadas do SellerDashboard)
const getCategoryIcon = (category) => {
    const icons = { telemovel: '📱', laptop: '💻', console: '🎮', tablet: '📟' };
    return icons[category] || '📦';
};

const getStatusBadge = (status) => {
    if (status === 'active') {
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Ativo</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inativo</span>;
};

const getConditionText = (condition) => {
    switch(condition) {
        case 'novo': return 'Novo';
        case 'semi-novo': return 'Semi-novo';
        case 'segunda-mao': return 'Segunda Mão';
        default: return condition || 'Semi-novo';
    }
};

const getConditionClass = (condition) => {
    switch(condition) {
        case 'novo': return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'semi-novo': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'segunda-mao': return 'bg-stone-300 text-stone-800 dark:bg-stone-700 dark:text-stone-300';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
};

export default Dashboard;