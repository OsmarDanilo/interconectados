import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { FiSearch } from 'react-icons/fi';

const Home = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('todos');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        fetchProducts();
    }, [category, searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const search = searchParams.get('search') || '';
            const response = await api.get('/products', {
                params: { category: category !== 'todos' ? category : undefined, search, limit: 12 }
            });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setSearchParams({ search: searchTerm });
        } else {
            setSearchParams({});
        }
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    useEffect(() => {
        const handleOpenModal = (event) => {
            if (event.detail) {
                openModal(event.detail);
            }
        };
        
        window.addEventListener('openProductModal', handleOpenModal);
        
        return () => {
            window.removeEventListener('openProductModal', handleOpenModal);
        };
    }, []);

    const categories = [
        { id: 'todos', name: 'Todos', icon: '📦' },
        { id: 'telemovel', name: 'Telemóveis', icon: '📱' },
        { id: 'laptop', name: 'Laptops', icon: '💻' },
        { id: 'tablet', name: 'Tablets', icon: '📟' },
        { id: 'console', name: 'Consoles', icon: '🎮' },
        { id: 'smartwatch', name: 'Smartwatches', icon: '⌚' },
        { id: 'audio', name: 'Áudio', icon: '🎧' },
        { id: 'acessorios', name: 'Acessórios', icon: '🔌' },
        { id: 'outros', name: 'Outros', icon: '📦' }
    ];

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center dark:from-stone-850 dark:to-stone-900">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">InterConectados</h1>
                <p className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-6 opacity-90 px-2">Conectando pessoas através da tecnologia</p>
                {!user && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <Link to="/register" className="bg-white text-primary-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-stone-50 transition text-sm sm:text-base dark:bg-stone-700 dark:text-white dark:hover:bg-stone-600">
                            Começar a Comprar
                        </Link>
                        <Link to="/register" className="border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition text-sm sm:text-base dark:border-stone-500 dark:hover:bg-stone-700">
                            Anunciar Grátis
                        </Link>
                    </div>
                )}
            </div>

            {/* Barra de Pesquisa */}
            <div className="mb-6 sm:mb-8 px-2 sm:px-0">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-xl border border-stone-100 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                    />
                    <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-stone-300 dark:text-stone-400" size={18} />
                    <button
                        type="submit"
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition font-medium text-sm"
                    >
                        Buscar
                    </button>
                </form>
            </div>

           {/* Categorias - Versão limpa e moderna */}
<div className="mb-8">
    <div className="border-b border-stone-100 dark:border-stone-600 mb-4">
        <h3 className="text-sm font-medium text-stone-400 dark:text-stone-300 pb-2">
            Explorar categorias
        </h3>
    </div>
    
    <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
            <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                    ${category === cat.id 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'bg-stone-25 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-600 border border-stone-100 dark:border-stone-600'
                    }
                `}
            >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
            </button>
        ))}
    </div>
</div>

            {/* Produtos - 1 por linha no mobile */}
            <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-700 dark:text-stone-100">Últimos Anúncios</h2>
                {searchParams.get('search') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSearchParams({});
                        }}
                        className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Limpar busca
                    </button>
                )}
            </div>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white dark:bg-stone-700 rounded-xl p-8 sm:p-12 text-center shadow mx-2 sm:mx-0">
                    <p className="text-stone-400 dark:text-stone-300">Nenhum produto encontrado.</p>
                    {searchParams.get('search') && (
                        <p className="text-xs sm:text-sm text-stone-300 dark:text-stone-400 mt-2">
                            Tente buscar com outras palavras ou <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="text-primary-600 dark:text-primary-400 hover:underline">limpar a busca</button>
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 px-2 sm:px-0">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onClick={() => openModal(product)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <ProductModal 
                product={selectedProduct}
                isOpen={modalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default Home;