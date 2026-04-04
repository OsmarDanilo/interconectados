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
            {/* Hero Section - Responsivo */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center dark:from-gray-800 dark:to-gray-900">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">InterConectados</h1>
                <p className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-6 opacity-90 px-2">Conectando pessoas através da tecnologia</p>
                {!user && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <Link to="/register" className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-sm sm:text-base dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                            Começar a Comprar
                        </Link>
                        <Link to="/register" className="border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-sm sm:text-base dark:border-gray-600 dark:hover:bg-gray-800">
                            Anunciar Grátis
                        </Link>
                    </div>
                )}
            </div>

            {/* Barra de Pesquisa - Responsiva */}
            <div className="mb-6 sm:mb-8 px-2 sm:px-0">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <button
                        type="submit"
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition font-medium text-sm"
                    >
                        Buscar
                    </button>
                </form>
            </div>

            {/* Categorias - Nome completo, sem abreviação */}
            <div className="mb-6 sm:mb-8">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide px-2 sm:px-0">
                    Categorias
                </h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2 px-2 sm:px-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full flex items-center justify-center gap-1 transition-all duration-200 text-xs ${
                                category === cat.id
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="font-medium whitespace-nowrap text-xs sm:text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Produtos - 2 por linha no mobile, 4 no desktop */}
            <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">Últimos Anúncios</h2>
                {searchParams.get('search') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSearchParams({});
                        }}
                        className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Limpar busca
                    </button>
                )}
            </div>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center shadow mx-2 sm:mx-0">
                    <p className="text-gray-500 dark:text-gray-400">Nenhum produto encontrado.</p>
                    {searchParams.get('search') && (
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Tente buscar com outras palavras ou <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="text-blue-600 dark:text-blue-400 hover:underline">limpar a busca</button>
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 px-2 sm:px-0">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onClick={() => openModal(product)}
                        />
                    ))}
                </div>
            )}

            {/* Modal de detalhes do produto */}
            <ProductModal 
                product={selectedProduct}
                isOpen={modalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default Home;