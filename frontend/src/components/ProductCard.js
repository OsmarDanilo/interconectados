import React, { useState, useEffect } from 'react';
import { FiMapPin, FiEye } from 'react-icons/fi';

const ProductCard = ({ product, onClick }) => {
    const [views, setViews] = useState(product?.views || 0);
    const mainPhoto = product.photos && product.photos[0] ? product.photos[0] : null;

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
                return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'semi-novo': 
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'segunda-mao': 
                return 'bg-stone-300 text-stone-800 dark:bg-stone-700 dark:text-stone-300';
            default: 
                return 'bg-stone-50 text-stone-500 dark:bg-stone-700 dark:text-stone-300';
        }
    };

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-stone-700 rounded-2xl shadow-sm hover:shadow-md active:shadow-sm overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer border border-stone-100 dark:border-stone-600"
        >
            <div className="relative h-40 sm:h-48 bg-stone-50 dark:bg-stone-600 border border-stone-100 dark:border-stone-600 border-b-0 rounded-t-xl overflow-hidden">
                {mainPhoto ? (
                    <img 
                        src={mainPhoto} 
                        alt={product.title} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl">
                        {getCategoryIcon(product.category)}
                    </div>
                )}
                <span className={`absolute top-2 right-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getConditionClass(product.condition)}`}>
                    {getConditionText(product.condition)}
                </span>
            </div>
            <div className="p-2 sm:p-4">
                <h3 className="font-semibold text-xs sm:text-base text-stone-700 dark:text-stone-100 mb-1 line-clamp-2">
                    {product.title}
                </h3>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <p className="text-sm sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                        {product.price.toLocaleString()} Kz
                    </p>
                    <div className="flex items-center gap-1 text-[8px] sm:text-xs text-stone-300 dark:text-stone-400">
                        <FiEye size={8} className="sm:w-3 sm:h-3" />
                        <span>{views}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-sm text-stone-400 dark:text-stone-300">
                    <div className="flex items-center">
                        <FiMapPin className="mr-0.5 sm:mr-1" size={10} />
                        <span className="truncate text-[9px] sm:text-sm">{product.location}</span>
                    </div>
                    <span className="truncate ml-1 text-[8px] sm:text-xs">{product.sellerName}</span>
                </div>
                <div className="text-[8px] sm:text-xs text-stone-300 dark:text-stone-400 mt-1">
                    📞 {getContactMethodIcon(product.contactMethod)}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;