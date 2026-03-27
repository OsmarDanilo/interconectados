import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiEye, FiPlus, FiX, FiMapPin, FiUser } from 'react-icons/fi';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ totalProducts: 0, totalViews: 0 });
    
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showContact, setShowContact] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/products/seller/${user.id}`);
            if (response.data.success) {
                setProducts(response.data.products);
                const totalViews = response.data.products.reduce((sum, p) => sum + (p.views || 0), 0);
                setStats({ 
                    totalProducts: response.data.products.length,
                    totalViews: totalViews
                });
            } else {
                setError('Erro ao carregar produtos');
            }
        } catch (error) {
            console.error('Erro detalhado:', error);
            setError(error.response?.data?.error || 'Erro ao carregar anúncios');
            toast.error('Erro ao carregar anúncios');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const handleUpdateViews = (event) => {
            const { productId, views } = event.detail;
            setProducts(prevProducts => 
                prevProducts.map(p => 
                    p.id === productId ? { ...p, views: views } : p
                )
            );
            setStats(prev => ({
                ...prev,
                totalViews: prev.totalViews + 1
            }));
        };
        
        window.addEventListener('updateProductViews', handleUpdateViews);
        
        return () => {
            window.removeEventListener('updateProductViews', handleUpdateViews);
        };
    }, []);

    const deleteProduct = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este anúncio?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Anúncio removido com sucesso!');
            fetchProducts();
        } catch (error) {
            toast.error('Erro ao remover anúncio');
        }
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setCurrentPhotoIndex(0);
        setShowContact(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
        setShowContact(false);
    };

    const getCategoryIcon = (category) => {
        const icons = { telemovel: '📱', laptop: '💻', console: '🎮', tablet: '📟' };
        return icons[category] || '📦';
    };

    const getStatusBadge = (status) => {
        if (status === 'active') {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">Ativo</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">Inativo</span>;
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

    const getContactMethodIcon = (method) => {
        if (method === 'whatsapp') return '💚 WhatsApp';
        if (method === 'call') return '📞 Ligação';
        return '💚 WhatsApp / 📞 Ligação';
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) closeModal();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button 
                    onClick={fetchProducts}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-8 dark:from-gray-800 dark:to-gray-900">
                <h1 className="text-2xl font-bold mb-2">Meu Painel</h1>
                <p className="opacity-90">Gerencie seus anúncios</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stats.totalProducts}</div>
                    <div className="text-gray-600 dark:text-gray-400">Total de Anúncios</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stats.totalViews}</div>
                    <div className="text-gray-600 dark:text-gray-400">Total de Visualizações</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Meus Anúncios</h2>
                <Link to="/create-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <FiPlus /> Novo Anúncio
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não tem anúncios.</p>
                    <Link to="/create-product" className="text-blue-600 dark:text-blue-400 hover:underline">Criar meu primeiro anúncio</Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Produto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Preço</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Visualizações</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.photos && product.photos[0] ? (
                                                    <img 
                                                        src={`http://localhost:3001${product.photos[0]}`} 
                                                        alt={product.title} 
                                                        className="w-12 h-12 object-cover rounded-lg" 
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                                                        {getCategoryIcon(product.category)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-200">{product.title}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{product.price.toLocaleString()} Kz</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getConditionClass(product.condition)}`}>
                                                {getConditionText(product.condition)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <FiEye size={14} />
                                                <span>{product.views || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openModal(product)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                                                    title="Visualizar"
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteProduct(product.id)} 
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                                                    title="Remover"
                                                >
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

            {/* Modal de detalhes do produto */}
            {modalOpen && selectedProduct && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] p-2 sm:p-4"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-[95%] sm:max-w-[90%] md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Detalhes do Produto</h2>
                            <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-400">
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5">
                            {/* Imagem Principal */}
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex justify-center items-center mb-4 h-64 sm:h-80 md:h-96 border border-gray-200 dark:border-gray-600">
                                {selectedProduct.photos && selectedProduct.photos[0] ? (
                                    <img 
                                        src={`http://localhost:3001${selectedProduct.photos[currentPhotoIndex]}`} 
                                        alt={selectedProduct.title} 
                                        className="max-w-full max-h-full object-contain rounded-lg" 
                                    />
                                ) : (
                                    <div className="text-6xl">{getCategoryIcon(selectedProduct.category)}</div>
                                )}
                            </div>

                            {/* Miniaturas */}
                            {selectedProduct.photos && selectedProduct.photos.length > 1 && (
                                <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                                    {selectedProduct.photos.map((photo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPhotoIndex(idx)}
                                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                                                currentPhotoIndex === idx ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            <img 
                                                src={`http://localhost:3001${photo}`} 
                                                alt={`Foto ${idx + 1}`} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">{selectedProduct.title}</h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionClass(selectedProduct.condition)}`}>
                                    {getConditionText(selectedProduct.condition)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{selectedProduct.category}</span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {selectedProduct.price.toLocaleString()} Kz
                                </p>
                                <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-sm">
                                    <FiEye size={16} />
                                    <span>{selectedProduct.views || 0} visualizações</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selectedProduct.description}</p>
                            </div>

                            <div className="space-y-2 mb-5 text-sm">
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <FiMapPin className="mr-2 text-gray-400 dark:text-gray-500" size={14} />
                                    <span>{selectedProduct.location}</span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <FiUser className="mr-2 text-gray-400 dark:text-gray-500" size={14} />
                                    <span>{selectedProduct.sellerName}</span>
                                </div>
                            </div>

                            {user && selectedProduct.sellerId !== user.id && (
                                <>
                                    {showContact ? (
                                        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                                            <p className="font-medium text-green-700 dark:text-green-400 mb-1">{getContactMethodIcon(selectedProduct.contactMethod)}</p>
                                            <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">{selectedProduct.contactNumber}</p>
                                            {selectedProduct.contactHours && (
                                                <p className="text-xs text-green-600 dark:text-green-500 mt-1">Horário: {selectedProduct.contactHours}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowContact(true)}
                                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                                        >
                                            Ver número do vendedor
                                        </button>
                                    )}
                                </>
                            )}

                            {user && selectedProduct.sellerId === user.id && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                                    <p className="text-blue-600 dark:text-blue-400 font-medium">📌 Este é seu anúncio</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {getContactMethodIcon(selectedProduct.contactMethod)}: {selectedProduct.contactNumber}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;