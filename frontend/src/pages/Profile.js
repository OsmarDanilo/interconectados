import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiLock, FiSave, FiEdit2, FiX, FiPackage, FiCalendar } from 'react-icons/fi';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [userStats, setUserStats] = useState({ totalProducts: 0, createdAt: '' });
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                phone: user.phone,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            if (user?.type === 'vendedor') {
                const response = await api.get(`/products/seller/${user.id}`);
                if (response.data.success) {
                    setUserStats({
                        totalProducts: response.data.products.length,
                        createdAt: user.createdAt
                    });
                }
            } else {
                setUserStats({
                    totalProducts: 0,
                    createdAt: user.createdAt
                });
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    };

    const validateAngolaPhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) return true;
        if (cleanPhone.length === 12 && cleanPhone.startsWith('2449')) return true;
        return false;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 9) value = value.slice(0, 9);
        setFormData({ ...formData, phone: value });
    };

    const handleSave = async () => {
        setError('');
        
        if (formData.name.length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        
        if (formData.phone !== user?.phone && !validateAngolaPhone(formData.phone)) {
            setError('Número de telefone inválido');
            return;
        }
        
        if (formData.newPassword) {
            if (formData.newPassword.length < 6) {
                setError('A nova senha deve ter pelo menos 6 caracteres');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError('As novas senhas não coincidem');
                return;
            }
            if (!formData.currentPassword) {
                setError('Digite sua senha atual');
                return;
            }
        }
        
        setLoading(true);
        
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone
            };
            
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }
            
            const response = await api.put('/auth/profile', updateData);
            
            if (response.data.success) {
                toast.success('Perfil atualizado!');
                user.name = formData.name;
                user.phone = formData.phone;
                localStorage.setItem('techmarket_user', JSON.stringify(user));
                setEditMode(false);
                setFormData({
                    name: formData.name,
                    phone: formData.phone,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao atualizar');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setEditMode(false);
        setError('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Data não disponível';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-2 sm:px-0">
            <div className="bg-white dark:bg-stone-700 rounded-2xl shadow-sm border border-stone-50 dark:border-stone-600 overflow-hidden">
                {/* Cabeçalho */}
                <div className=" from-primary-50 to-primary-100 dark:from-stone-600 dark:to-stone-700 px-4 sm:px-6 py-5 border-b border-stone-50 dark:border-stone-600">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold text-stone-700 dark:text-stone-100">Meu Perfil</h1>
                            <p className="text-sm text-stone-400 dark:text-stone-300 mt-1">Gerencie suas informações</p>
                        </div>
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex-shrink-0 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 active:bg-primary-50 transition text-sm flex items-center gap-1.5 bg-white dark:bg-stone-600 px-3 py-2 rounded-lg shadow-sm"
                            >
                                <FiEdit2 size={14} />
                                <span>Editar</span>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="p-4 sm:p-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-5 border border-red-100 dark:border-red-800">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-5">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-stone-500 dark:text-stone-300 mb-1">
                                <FiUser className="inline mr-2" size={14} /> Nome De Usuário
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-stone-100 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 dark:bg-stone-600 dark:text-white transition"
                                />
                            ) : (
                                <div className="px-4 py-2 bg-stone-25 dark:bg-stone-600 rounded-lg text-stone-600 dark:text-stone-150 border border-stone-50 dark:border-stone-500">
                                    {user.name}
                                </div>
                            )}
                        </div>
                        
                        {/* Telefone */}
                        <div>
                            <label className="block text-sm font-medium text-stone-500 dark:text-stone-300 mb-1">
                                <FiPhone className="inline mr-2" size={14} /> Telefone
                            </label>
                            {editMode ? (
                                <div>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="w-full px-4 py-3 border border-stone-100 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 dark:bg-stone-600 dark:text-white transition"
                                        placeholder="923456789"
                                    />
                                    <p className="text-xs text-stone-300 dark:text-stone-400 mt-1">Apenas números. Ex: 923456789</p>
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-stone-25 dark:bg-stone-600 rounded-lg text-stone-600 dark:text-stone-150 border border-stone-50 dark:border-stone-500">
                                    {user.phone}
                                </div>
                            )}
                        </div>
                        
                        {/* Tipo de conta */}
                        <div>
                            <label className="block text-sm font-medium text-stone-500 dark:text-stone-300 mb-1">Tipo de conta</label>
                            <div className="px-4 py-2 bg-stone-25 dark:bg-stone-600 rounded-lg border border-stone-50 dark:border-stone-500">
                                {user.type === 'vendedor' ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                        <span className="text-stone-600 dark:text-stone-150">Vendedor</span>
                                        <span className="text-xs text-stone-300 dark:text-stone-400 ml-2">-</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-stone-600 dark:text-stone-150">Comprador</span>
                                        <span className="text-xs text-stone-300 dark:text-stone-400 ml-2">-</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Informações específicas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {user.type === 'vendedor' && (
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl p-4 border border-primary-100 dark:border-primary-800">
                                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                                        <FiPackage size={16} />
                                        <span className="text-xs font-medium uppercase tracking-wide">Anúncios</span>
                                    </div>
                                    <div className="text-2xl font-semibold text-primary-700 dark:text-primary-400">
                                        {userStats.totalProducts}
                                    </div>
                                    <div className="text-xs text-primary-500 dark:text-primary-500 mt-1">
                                        {userStats.totalProducts === 1 ? 'produto anunciado' : 'produtos anunciados'}
                                    </div>
                                </div>
                            )}
                            
                            <div className={`${user.type === 'vendedor' ? '' : 'md:col-span-2'} bg-stone-25 dark:bg-stone-600 rounded-xl p-4 border border-stone-50 dark:border-stone-500`}>
                                <div className="flex items-center gap-2 text-stone-400 dark:text-stone-300 mb-2">
                                    <FiCalendar size={16} />
                                    <span className="text-xs font-medium uppercase tracking-wide">Membro desde</span>
                                </div>
                                <div className="text-stone-600 dark:text-stone-150 font-medium">
                                    {formatDate(userStats.createdAt || user.createdAt)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Alterar senha - modo edição */}
                        {editMode && (
                            <div className="border-t border-stone-50 dark:border-stone-600 pt-4 mt-2">
                                <h3 className="text-sm font-medium text-stone-600 dark:text-stone-150 mb-3 flex items-center gap-2">
                                    <FiLock size={14} />
                                    Alterar senha
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-stone-400 dark:text-stone-300 mb-1">Senha atual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Digite sua senha atual"
                                            className="w-full px-4 py-2 border border-stone-100 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-400 dark:bg-stone-600 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 dark:text-stone-300 mb-1">Nova senha</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full px-4 py-2 border border-stone-100 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-400 dark:bg-stone-600 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-400 dark:text-stone-300 mb-1">Confirmar nova senha</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Digite novamente"
                                            className="w-full px-4 py-2 border border-stone-100 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-400 dark:bg-stone-600 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Botões */}
                        {editMode && (
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <FiSave size={14} />
                                    {loading ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-stone-50 dark:bg-stone-600 text-stone-500 dark:text-stone-300 py-3 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-500 active:bg-stone-150 transition flex items-center justify-center gap-2"
                                >
                                    <FiX size={14} />
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;