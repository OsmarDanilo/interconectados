import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                
                {/* Links principais - centralizado */}
                <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
                    <Link to="/" className="text-gray-400 hover:text-white transition">Início</Link>
                    <Link to="/register" className="text-gray-400 hover:text-white transition">Anunciar</Link>
                    <Link to="/login" className="text-gray-400 hover:text-white transition">Entrar</Link>
                    <Link to="/contato" className="text-gray-400 hover:text-white transition">Contato</Link>
                    <Link to="/ajuda" className="text-gray-400 hover:text-white transition">Ajuda</Link>
                </div>

                {/* Contato - simplificado */}
                <div className="text-center text-sm text-gray-400 space-y-1 mb-6">
                    <p>📞 +244 923 456 789</p>
                    <p>✉️ contato@interconectados.co.ao</p>
                    <p>⏰ Seg-Sex: 8h-18h | Sáb: 8h-13h</p>
                </div>

                {/* Copyright */}
                <div className="text-center text-gray-500 text-xs pt-4 border-t border-gray-800">
                    <p>&copy; {new Date().getFullYear()} InterConectados. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;