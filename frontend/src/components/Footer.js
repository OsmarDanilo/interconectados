import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto transition-colors">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                {/* Grid responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    
                    {/* Logo e descrição */}
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            <h3 className="text-base sm:text-lg font-bold">InterConectados</h3>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                            Conectando pessoas através da tecnologia em Angola.
                        </p>
                    </div>

                    {/* Links Rápidos */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Links Rápidos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition text-xs sm:text-sm">Início</Link></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-white transition text-xs sm:text-sm">Anunciar</Link></li>
                            <li><Link to="/login" className="text-gray-400 hover:text-white transition text-xs sm:text-sm">Entrar</Link></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-white transition text-xs sm:text-sm">Cadastrar</Link></li>
                        </ul>
                    </div>

                    {/* Contato */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Contato</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-xs sm:text-sm">
                                <span>📞</span> +244 923 456 789
                            </li>
                            <li className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-xs sm:text-sm break-all">
                                <span>✉️</span> contato@interconectados.co.ao
                            </li>
                        </ul>
                    </div>

                    {/* Horário */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Horário</h4>
                        <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
                            <li>Segunda a Sexta: 8h às 18h</li>
                            <li>Sábado: 8h às 13h</li>
                            <li className="text-gray-500 text-[10px] sm:text-xs mt-2">Atendimento online 24h</li>
                        </ul>
                    </div>
                </div>

                {/* Direitos autorais */}
                <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                        &copy; {new Date().getFullYear()} InterConectados. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-600 text-[8px] sm:text-[10px] mt-1">
                        Conectando pessoas através da tecnologia
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;