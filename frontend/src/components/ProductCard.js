import React, { useState, useEffect } from 'react';
import { FiMapPin, FiEye } from 'react-icons/fi';

const ProductCard = ({ product, onClick }) => {
    const [views, setViews] = useState(product?.views || 0);
    const mainPhoto = product.photos && product.photos[0] ? `http://localhost:3001${product.photos[0]}` : null;

    useEffect(() => {
        setViews(product?.views || 0);
    }, [product?.views]);

    useEffect(() => {
        const handleUpdateViews = (event) => {
            if (event.detail.productId === product.id) {
                setViews(event.detail.views);
            }
        };
        
        window.addEventListener('updateProductViews', handleUpdateViews);
        
        return () => {
            window.removeEventListener('updateProductViews', handleUpdateViews);
        };
    }, [product.id]);

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
            case 'novo': 
                return 'bg-green-50 text-green-700 dark:bg-green-50 dark:text-green-700';
            case 'semi-novo': 
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-50 dark:text-yellow-700';
            case 'segunda-mao': 
                return 'bg-stone-300 text-stone-800 dark:bg-stone-300 dark:text-stone-800';
            default: 
                return 'bg-gray-100 text-gray-600 dark:bg-gray-100 dark:text-gray-600';
        }
    };

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
            <div className="relative h-48 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 border-b-0 rounded-t-xl overflow-hidden">
                {mainPhoto ? (
                    <img 
                        src={mainPhoto} 
                        alt={product.title} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        {getCategoryIcon(product.category)}
                    </div>
                )}
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getConditionClass(product.condition)}`}>
                    {getConditionText(product.condition)}
                </span>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">{product.title}</h3>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {product.price.toLocaleString()} Kz
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <FiEye size={12} />
                        <span>{views}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <FiMapPin className="mr-1" size={14} />
                        <span className="truncate">{product.location}</span>
                    </div>
                    <span className="truncate ml-2">{product.sellerName}</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    📞 {getContactMethodIcon(product.contactMethod)}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;