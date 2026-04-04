import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-auto">
            <div className="container mx-auto px-4 py-8 sm:py-12">
                
                {/* Logo e descrição - centralizado no mobile */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        <h3 className="text-xl font-bold">InterConectados</h3>
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Conectando pessoas através da tecnologia em Angola.
                    </p>
                </div>

                {/* Links Rápidos - grid 2 colunas no mobile */}
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                    <div>
                        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Navegação</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition block py-1">Início</Link></li>
                            <li><Link to="/register" className="text-gray-300 hover:text-white transition block py-1">Anunciar</Link></li>
                            <li><Link to="/login" className="text-gray-300 hover:text-white transition block py-1">Entrar</Link></li>
                            <li><Link to="/register" className="text-gray-300 hover:text-white transition block py-1">Cadastrar</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Suporte</h4>
                        <ul className="space-y-3">
                            <li><Link to="/ajuda" className="text-gray-300 hover:text-white transition block py-1">Ajuda</Link></li>
                            <li><Link to="/contato" className="text-gray-300 hover:text-white transition block py-1">Contato</Link></li>
                            <li><Link to="/termos" className="text-gray-300 hover:text-white transition block py-1">Termos</Link></li>
                            <li><Link to="/privacidade" className="text-gray-300 hover:text-white transition block py-1">Privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Contato - cards com ícones */}
                <div className="space-y-3 mb-8 max-w-md mx-auto">
                    <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center mb-4">Contato</h4>
                    <div className="bg-gray-800/50 rounded-xl p-3 flex items-center justify-center gap-3">
                        <span className="text-xl">📞</span>
                        <span className="text-gray-300 text-sm">+244 923 456 789</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3 flex items-center justify-center gap-3">
                        <span className="text-xl">✉️</span>
                        <span className="text-gray-300 text-sm break-all">contato@interconectados.co.ao</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3 flex items-center justify-center gap-3">
                        <span className="text-xl">⏰</span>
                        <span className="text-gray-300 text-sm">Seg-Sex: 8h-18h | Sáb: 8h-13h</span>
                    </div>
                </div>

                {/* Redes Sociais - placeholder */}
                <div className="flex justify-center gap-6 mb-8">
                    <a href="#" className="text-gray-400 hover:text-white transition text-2xl">📘</a>
                    <a href="#" className="text-gray-400 hover:text-white transition text-2xl">📸</a>
                    <a href="#" className="text-gray-400 hover:text-white transition text-2xl">🐦</a>
                    <a href="#" className="text-gray-400 hover:text-white transition text-2xl">💼</a>
                </div>

                {/* Copyright */}
                <div className="text-center pt-6 border-t border-gray-800">
                    <p className="text-gray-500 text-xs">
                        &copy; {new Date().getFullYear()} InterConectados. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-600 text-[10px] mt-2">
                        Conectando pessoas através da tecnologia
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;