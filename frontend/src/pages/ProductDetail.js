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
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
            {/* Botão Voltar */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-stone-400 dark:text-stone-300 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition py-2 -ml-1 px-1"
            >
                <FiArrowLeft size={18} />
                <span>Voltar</span>
            </button>

            {/* Card do Produto */}
            <div className="bg-white dark:bg-stone-700 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-600 overflow-hidden">
                {/* Área da Imagem Principal */}
                <div className="bg-stone-50 dark:bg-stone-600 p-4 sm:p-8 flex justify-center items-center min-h-[260px] sm:min-h-[400px]">
                    {product.photos && product.photos.length > 0 ? (
                        <img 
                            src={product.photos[currentPhotoIndex]} 
                            alt={product.title} 
                            className="max-w-full max-h-[240px] sm:max-h-[350px] object-contain" 
                        />
                    ) : (
                        <div className="text-6xl sm:text-8xl text-stone-300 dark:text-stone-400">
                            {getCategoryIcon(product.category)}
                        </div>
                    )}
                </div>

                {/* Miniaturas */}
                {product.photos && product.photos.length > 1 && (
                    <div className="flex gap-2 p-3 sm:p-4 bg-white dark:bg-stone-700 border-t border-stone-50 dark:border-stone-600 overflow-x-auto">
                        {product.photos.map((photo, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPhotoIndex(idx)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                                    currentPhotoIndex === idx ? 'border-primary-600 dark:border-primary-400' : 'border-stone-100 dark:border-stone-500'
                                }`}
                            >
                                <img 
                                    src={photo} 
                                    alt={`Foto ${idx + 1}`} 
                                    className="w-full h-full object-cover" 
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Informações do Produto */}
                <div className="p-4 sm:p-6">
                    {/* Título e Estado */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h1 className="text-lg sm:text-2xl font-bold text-stone-700 dark:text-stone-100">{product.title}</h1>
                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                            product.condition === 'novo'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                            {product.condition === 'novo' ? 'Novo' : 'Semi-novo'}
                        </span>
                    </div>
                    
                    {/* Categoria */}
                    <p className="text-sm text-stone-400 dark:text-stone-300 mb-4">{product.category}</p>
                    
                    {/* Preço */}
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                        {product.price.toLocaleString()} Kz
                    </p>
                    
                    {/* Descrição */}
                    <div className="border-t border-stone-50 dark:border-stone-600 pt-4 mb-4">
                        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-150 leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                    
                    {/* Informações adicionais */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-stone-400 dark:text-stone-300">
                            <FiMapPin className="mr-2 text-stone-300 dark:text-stone-400 flex-shrink-0" size={16} />
                            <span className="text-sm">{product.location}</span>
                        </div>
                        <div className="flex items-center text-stone-400 dark:text-stone-300">
                            <FiUser className="mr-2 text-stone-300 dark:text-stone-400 flex-shrink-0" size={16} />
                            <span className="text-sm">Vendedor: {product.sellerName}</span>
                        </div>
                        <div className="flex items-center text-stone-300 dark:text-stone-400 text-sm">
                            <FiEye className="mr-2 flex-shrink-0" size={14} />
                            <span>{product.views || 0} visualizações</span>
                        </div>
                    </div>
                    
                    {/* Área de Contato */}
                    {!isOwner && (
                        <div className="mt-4">
                            {showContact ? (
                                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                        <FiPhone className="text-green-500 dark:text-green-400 flex-shrink-0" />
                                        <span className="font-medium text-sm sm:text-base">{getContactMethodIcon(product.contactMethod)}</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-400 mb-1">{product.contactNumber}</p>
                                    {product.contactHours && (
                                        <p className="text-sm text-green-600 dark:text-green-500">Horário: {product.contactHours}</p>
                                    )}
                                    <p className="text-xs text-green-500 dark:text-green-500/80 mt-2">Clique no número para entrar em contato</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleContact}
                                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 active:bg-primary-800 transition text-sm sm:text-base"
                                >
                                    Ver número do vendedor
                                </button>
                            )}
                        </div>
                    )}
                    
                    {isOwner && (
                        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 border border-primary-200 dark:border-primary-800 mt-4">
                            <p className="text-primary-600 dark:text-primary-400 font-medium mb-2 text-sm sm:text-base">📌 Este é seu anúncio</p>
                            <p className="text-sm text-primary-600 dark:text-primary-400">
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