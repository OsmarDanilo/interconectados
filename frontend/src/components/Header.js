import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { FiUser, FiLogOut, FiShoppingBag, FiPlusCircle, FiSearch, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const timeoutRef = useRef(null);
    const menuContainerRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        setMobileMenuOpen(false);
    };

    const openMenu = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setMenuOpen(true);
    };

    const closeMenu = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setMenuOpen(false);
        }, 300);
    };

    const cancelClose = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md sticky top-0 z-50 transition-colors dark:from-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path d="M8 4v16" />
                                <path d="M16 4v16" />
                                <path d="M4 8h4" />
                                <path d="M4 16h4" />
                                <path d="M4 12h16" />
                                <path d="M16 8h4" />
                                <path d="M16 16h4" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-base sm:text-lg font-bold">InterConectados</span>
                            <span className="text-xs opacity-80 hidden sm:block">Conectando pessoas</span>
                        </div>
                        <div className="block sm:hidden">
                            <span className="text-sm font-bold">InterConectados</span>
                        </div>
                    </Link>

                    {/* Desktop Search - esconde no mobile */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar produtos..."
                                className="w-full px-4 py-2 pl-10 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </form>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <>
                                {user.type === 'vendedor' && (
                                    <Link to="/create-product" className="flex items-center space-x-1 bg-white text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                                        <FiPlusCircle size={16} />
                                        <span className="hidden lg:inline text-sm">Anunciar</span>
                                    </Link>
                                )}
                                <Link to={user.type === 'vendedor' ? '/seller/dashboard' : '/buyer/dashboard'} className="hover:text-gray-200 transition">
                                    <FiShoppingBag size={20} />
                                </Link>
                                <div 
                                    ref={menuContainerRef}
                                    className="relative"
                                    onMouseEnter={openMenu}
                                    onMouseLeave={closeMenu}
                                >
                                    <button className="flex items-center space-x-2 hover:text-gray-200 transition px-2 py-1 rounded">
                                        <span className="text-sm hidden sm:inline">{user.name}</span>
                                    </button>
                                    {menuOpen && (
                                        <div 
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700"
                                            onMouseEnter={cancelClose}
                                            onMouseLeave={closeMenu}
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <FiUser size={16} />
                                                <span>Meu Perfil</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-700 dark:text-gray-300 transition"
                                            >
                                                <FiLogOut size={16} />
                                                <span>Sair</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="flex items-center space-x-1 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                                    <FiUser size={16} />
                                    <span className="text-sm">Entrar</span>
                                </Link>
                                <Link to="/register" className="flex items-center space-x-1 border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition dark:border-gray-600 dark:hover:bg-gray-800">
                                    <span className="text-sm">Cadastrar</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-white/20 space-y-3">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar produtos..."
                                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
                        </form>

                        {/* Mobile Navigation */}
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Tema</span>
                                <ThemeToggle />
                            </div>
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FiUser size={18} />
                                        <span>Meu Perfil</span>
                                    </Link>
                                    {user.type === 'vendedor' && (
                                        <Link
                                            to="/create-product"
                                            className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <FiPlusCircle size={18} />
                                            <span>Anunciar</span>
                                        </Link>
                                    )}
                                    <Link
                                        to={user.type === 'vendedor' ? '/seller/dashboard' : '/buyer/dashboard'}
                                        className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FiShoppingBag size={18} />
                                        <span>Meu Painel</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition w-full text-left"
                                    >
                                        <FiLogOut size={18} />
                                        <span>Sair</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FiUser size={18} />
                                        <span>Entrar</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center space-x-2 py-2 hover:bg-white/10 rounded-lg px-2 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Cadastrar</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;