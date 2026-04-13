import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto transition-colors">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
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
                            <h3 className="text-lg font-bold">InterConectados</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Conectando pessoas através da tecnologia em Angola.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition">Início</Link></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-white transition">Anunciar</Link></li>
                            <li><Link to="/login" className="text-gray-400 hover:text-white transition">Entrar</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4">Contato</h4>
                        <p className="text-gray-400 text-sm">📞 +244 923 456 789</p>
                        <p className="text-gray-400 text-sm">✉️ contato@interconectados.co.ao</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4">Horário</h4>
                        <p className="text-gray-400 text-sm">Segunda a Sexta: 8h às 18h</p>
                        <p className="text-gray-400 text-sm">Sábado: 8h às 13h</p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2024 InterConectados. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;