import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiMapPin, FiPhone, FiUser, FiX, FiEye } from 'react-icons/fi';

const ProductModal = ({ product, isOpen, onClose }) => {
    const { user } = useAuth();
    const [showContact, setShowContact] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [currentProduct, setCurrentProduct] = useState(product);
    const [views, setViews] = useState(product?.views || 0);
    const [viewRegistered, setViewRegistered] = useState(false);

    useEffect(() => {
        setCurrentProduct(product);
        setViews(product?.views || 0);
        setViewRegistered(false);
    }, [product]);

    useEffect(() => {
        if (isOpen && product?.id && !viewRegistered) {
            registerView();
        }
    }, [isOpen, product?.id, viewRegistered]);

    const registerView = async () => {
        setViewRegistered(true);
        
        // COMENTADO: Vendedor agora também conta visualização
        // if (user && product.sellerId === user.id) {
        //     console.log('Vendedor vendo próprio produto - não conta');
        //     return;
        // }
        
        const storageKey = `viewed_${product.id}`;
        const alreadyViewed = localStorage.getItem(storageKey);
        
        if (alreadyViewed) {
            console.log('Usuário já visualizou este produto antes - não conta');
            return;
        }
        
        try {
            localStorage.setItem(storageKey, Date.now().toString());
            
            const response = await api.post(`/products/${product.id}/view`);
            if (response.data.success) {
                setViews(response.data.views);
                console.log(`✅ Visualização contada! Total: ${response.data.views}`);
                
                window.dispatchEvent(new CustomEvent('updateProductViews', { 
                    detail: { productId: product.id, views: response.data.views } 
                }));
            }
        } catch (error) {
            console.error('Erro ao registrar visualização:', error);
            localStorage.removeItem(storageKey);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !currentProduct) return null;

    const isOwner = user && currentProduct.sellerId === user.id;
    
    const getCategoryIcon = (category) => {
        const icons = { telemovel: '📱', laptop: '💻', console: '🎮', tablet: '📟' };
        return icons[category] || '📦';
    };

    const getContactMethodIcon = (method) => {
        if (method === 'whatsapp') return '💚 WhatsApp';
        if (method === 'call') return '📞 Ligação';
        return '💚 WhatsApp / 📞 Ligação';
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

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1000] p-2 sm:p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-[95%] sm:max-w-[90%] md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Detalhes do Produto</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-400">
                        <FiX size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-5">
                    {/* Imagem Principal */}
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex justify-center items-center mb-4 h-56 sm:h-80 md:h-96 border border-gray-200 dark:border-gray-600">
                        {currentProduct.photos && currentProduct.photos[0] ? (
                            <img 
                                src={currentProduct.photos[currentPhotoIndex]} 
                                alt={currentProduct.title} 
                                className="max-w-full max-h-full object-contain rounded-lg" 
                            />
                        ) : (
                            <div className="text-6xl">{getCategoryIcon(currentProduct.category)}</div>
                        )}
                    </div>

                    {/* Miniaturas */}
                    {currentProduct.photos && currentProduct.photos.length > 1 && (
                        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                            {currentProduct.photos.map((photo, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPhotoIndex(idx)}
                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                                        currentPhotoIndex === idx ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
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

                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">{currentProduct.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionClass(currentProduct.condition)}`}>
                            {getConditionText(currentProduct.condition)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{currentProduct.category}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {currentProduct.price.toLocaleString()} Kz
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                            <FiEye size={14} />
                            <span>{views} visualizações</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{currentProduct.description}</p>
                    </div>

                    <div className="space-y-2 mb-5 text-xs sm:text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <FiMapPin className="mr-2 text-gray-400 dark:text-gray-500" size={14} />
                            <span>{currentProduct.location}</span>
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <FiUser className="mr-2 text-gray-400 dark:text-gray-500" size={14} />
                            <span>{currentProduct.sellerName}</span>
                        </div>
                    </div>

                    {!isOwner && (
                        <>
                            {showContact ? (
                                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                                    <p className="font-medium text-green-700 dark:text-green-400 mb-1 text-sm">{getContactMethodIcon(currentProduct.contactMethod)}</p>
                                    <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">{currentProduct.contactNumber}</p>
                                    {currentProduct.contactHours && (
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">Horário: {currentProduct.contactHours}</p>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            alert('Faça login para ver o contato');
                                            return;
                                        }
                                        setShowContact(true);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base"
                                >
                                    Ver número do vendedor
                                </button>
                            )}
                        </>
                    )}

                    {isOwner && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">📌 Este é seu anúncio</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {getContactMethodIcon(currentProduct.contactMethod)}: {currentProduct.contactNumber}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;