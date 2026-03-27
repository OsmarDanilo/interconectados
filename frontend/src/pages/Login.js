import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock } from 'react-icons/fi';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loginType, setLoginType] = useState('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateAngolaPhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) return true;
        if (cleanPhone.length === 12 && cleanPhone.startsWith('2449')) return true;
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!identifier || !password) {
            setError('Preencha todos os campos');
            return;
        }
        
        if (loginType === 'phone') {
            const cleanPhone = identifier.replace(/\D/g, '');
            if (!validateAngolaPhone(cleanPhone)) {
                setError('Número de telefone inválido');
                return;
            }
        }
        
        setLoading(true);
        const result = await login(identifier, password);
        if (result.success) {
            navigate(result.user.type === 'vendedor' ? '/seller/dashboard' : '/');
        } else {
            setError('Usuário ou senha incorretos');
        }
        setLoading(false);
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 9) value = value.slice(0, 9);
        setIdentifier(value);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Entrar</h2>
                {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                
                <div className="flex gap-2 mb-6">
                    <button onClick={() => { setLoginType('phone'); setIdentifier(''); setError(''); }} 
                        className={`flex-1 py-2 rounded-lg border transition ${
                            loginType === 'phone' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-600'
                        }`}>
                        <FiPhone className="inline mr-2" /> Telefone
                    </button>
                    <button onClick={() => { setLoginType('name'); setIdentifier(''); setError(''); }} 
                        className={`flex-1 py-2 rounded-lg border transition ${
                            loginType === 'name' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-600'
                        }`}>
                        <FiUser className="inline mr-2" /> Nome
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">{loginType === 'phone' ? 'Telefone' : 'Nome'}</label>
                        <div className="relative">
                            {loginType === 'phone' ? 
                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> : 
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            }
                            <input 
                                type={loginType === 'phone' ? 'tel' : 'text'} 
                                value={identifier} 
                                onChange={loginType === 'phone' ? handlePhoneChange : (e) => setIdentifier(e.target.value)} 
                                placeholder={loginType === 'phone' ? "923456789" : "Seu nome"} 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                        {loginType === 'phone' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Apenas números. Ex: 923456789</p>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Senha</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Sua senha" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                
                <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                    Não tem conta? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;