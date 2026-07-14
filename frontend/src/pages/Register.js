import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock } from 'react-icons/fi';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateAngolaPhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) return true;
        if (cleanPhone.length === 12 && cleanPhone.startsWith('2449')) return true;
        return false;
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 9) value = value.slice(0, 9);
        setPhone(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (name.length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        
        if (!validateAngolaPhone(phone)) {
            setError('Número de telefone inválido');
            return;
        }
        
        if (password !== confirm) {
            setError('As senhas não coincidem');
            return;
        }
        
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        setLoading(true);
        const result = await register(name, phone, password);
        if (result.success) {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Criar conta</h2>
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Nome completo *</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="Seu nome (mínimo 3 caracteres)" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Número de Telefone *</label>
                        <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={handlePhoneChange} 
                                placeholder="923456789" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Apenas números. Ex: 923456789</p>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Senha *</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Mínimo 6 caracteres" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirmar senha *</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="password" 
                                value={confirm} 
                                onChange={e => setConfirm(e.target.value)} 
                                placeholder="Digite a senha novamente" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                    Já tem conta?{' '}
                    <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;