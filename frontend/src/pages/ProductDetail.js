import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiPhone, FiUser, FiArrowLeft, FiEye } from 'react-icons/fi';

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data.product);
        } catch (error) {
            toast.error('Produto não encontrado');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = { telemovel: '📱', laptop: '💻', console: '🎮', tablet: '📟' };
        return icons[category] || '📦';
    };

    const getContactMethodIcon = (method) => {
        if (method === 'whatsapp') return '💚 WhatsApp';
        if (method === 'call') return '📞 Ligação';
        return '💚 WhatsApp / 📞 Ligação';
    };

    const handleContact = () => {
        if (!user) {
            toast.error('Faça login para ver o contato');
            navigate('/login');
            return;
        }
        setShowContact(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) return null;

    const isOwner = user && product.sellerId === user.id;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Botão Voltar */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 transition"
            >
                <FiArrowLeft size={18} />
                <span>Voltar</span>
            </button>

            {/* Card do Produto */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Área da Imagem Principal */}
                <div className="bg-gray-100 p-8 flex justify-center items-center min-h-[400px]">
                    {product.photos && product.photos.length > 0 ? (
                        <img 
                            src={`http://localhost:3001${product.photos[currentPhotoIndex]}`} 
                            alt={product.title} 
                            className="max-w-full max-h-[350px] object-contain" 
                        />
                    ) : (
                        <div className="text-8xl text-gray-400">
                            {getCategoryIcon(product.category)}
                        </div>
                    )}
                </div>

                {/* Miniaturas */}
                {product.photos && product.photos.length > 1 && (
                    <div className="flex gap-2 p-4 bg-white border-t overflow-x-auto">
                        {product.photos.map((photo, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPhotoIndex(idx)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                                    currentPhotoIndex === idx ? 'border-primary-600' : 'border-gray-200'
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

                {/* Informações do Produto */}
                <div className="p-6">
                    {/* Título e Estado */}
                    <div className="flex items-start justify-between mb-2">
                        <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.condition === 'novo' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                            {product.condition === 'novo' ? 'Novo' : 'Semi-novo'}
                        </span>
                    </div>
                    
                    {/* Categoria */}
                    <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                    
                    {/* Preço */}
                    <p className="text-3xl font-bold text-primary-600 mb-6">
                        {product.price.toLocaleString()} Kz
                    </p>
                    
                    {/* Descrição */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                    
                    {/* Informações adicionais */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-gray-500">
                            <FiMapPin className="mr-2 text-gray-400" size={16} />
                            <span className="text-sm">{product.location}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                            <FiUser className="mr-2 text-gray-400" size={16} />
                            <span className="text-sm">Vendedor: {product.sellerName}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                            <FiEye className="mr-2" size={14} />
                            <span>{product.views || 0} visualizações</span>
                        </div>
                    </div>
                    
                    {/* Área de Contato */}
                    {!isOwner && (
                        <div className="mt-4">
                            {showContact ? (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <FiPhone className="text-green-500" />
                                        <span className="font-medium">{getContactMethodIcon(product.contactMethod)}</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-700 mb-1">{product.contactNumber}</p>
                                    {product.contactHours && (
                                        <p className="text-sm text-green-600">Horário: {product.contactHours}</p>
                                    )}
                                    <p className="text-xs text-green-500 mt-2">Clique no número para entrar em contato</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleContact}
                                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition"
                                >
                                    Ver número do vendedor
                                </button>
                            )}
                        </div>
                    )}
                    
                    {isOwner && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
                            <p className="text-blue-600 font-medium mb-2">📌 Este é seu anúncio</p>
                            <p className="text-sm text-blue-600">
                                <strong>Contato:</strong> {getContactMethodIcon(product.contactMethod)}<br />
                                <strong>Número:</strong> {product.contactNumber}
                                {product.contactHours && <><br /><strong>Horário:</strong> {product.contactHours}</>}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;