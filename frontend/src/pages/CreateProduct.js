import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { angolaLocations } from '../data/angola';

const CreateProduct = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [locationType, setLocationType] = useState('select');
    const [contactError, setContactError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'telemovel',
        condition: 'semi-novo',
        province: '',
        municipality: '',
        customLocation: '',
        contactMethod: 'whatsapp',
        contactNumber: '',
        contactHours: ''
    });

    const provinces = Object.keys(angolaLocations).sort();
    const municipalities = formData.province ? angolaLocations[formData.province] || [] : [];

if (!user) {
    return <Navigate to="/login" />;
}

    const validateAngolaPhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) return true;
        if (cleanPhone.length === 12 && cleanPhone.startsWith('2449')) return true;
        return false;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProvinceChange = (e) => {
        setFormData({ 
            ...formData, 
            province: e.target.value, 
            municipality: ''
        });
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 9) value = value.slice(0, 9);
        setFormData({ ...formData, contactNumber: value });
        setContactError('');
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 5) {
            toast.error('Máximo de 5 fotos');
            return;
        }
        setPhotos([...photos, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPhotoPreviews(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    const setMainPhoto = (index) => {
        const photo = photos.splice(index, 1)[0];
        const preview = photoPreviews.splice(index, 1)[0];
        setPhotos([photo, ...photos]);
        setPhotoPreviews([preview, ...photoPreviews]);
        toast.success('Foto principal alterada!');
    };

    const getLocationValue = () => {
        if (locationType === 'select') {
            if (!formData.province) return '';
            if (formData.municipality) {
                return `${formData.province}, ${formData.municipality}`;
            }
            return formData.province;
        }
        return formData.customLocation;
    };

    const getConditionDescription = (condition) => {
        switch(condition) {
            case 'novo':
                return 'Produto novo, nunca usado, na caixa original';
            case 'semi-novo':
                return 'Produto com pouco uso, em ótimas condições';
            case 'segunda-mao':
                return 'Produto usado, pode apresentar sinais de desgaste';
            default:
                return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const location = getLocationValue();
        
        if (!location) {
            toast.error('Por favor, informe sua localização');
            return;
        }
        
        if (!formData.title || !formData.description || !formData.price) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }
        
        if (!formData.contactNumber) {
            toast.error('Por favor, informe o número de contacto');
            return;
        }
        
        if (!validateAngolaPhone(formData.contactNumber)) {
            toast.error('Número de telefone inválido. Use um número angolano válido (ex: 923456789)');
            return;
        }
        
        setLoading(true);
        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('price', formData.price);
        form.append('category', formData.category);
        form.append('condition', formData.condition);
        form.append('location', location);
        form.append('contactMethod', formData.contactMethod);
        form.append('contactNumber', formData.contactNumber);
        form.append('contactHours', formData.contactHours);
        photos.forEach(photo => form.append('photos', photo));
        
        try {
            const response = await api.post('/products', form, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            if (response.data.success) {
                toast.success('Anúncio criado com sucesso!');
                navigate('/seller/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao criar anúncio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-2 sm:px-0">
            <div className="bg-white dark:bg-stone-700 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-600 p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-700 dark:text-stone-100 mb-6">Anunciar Produto</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-stone-600 dark:text-stone-150 mb-1">Título *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ex: iPhone 12 128GB"
                            className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-stone-600 dark:text-stone-150 mb-1">Descrição *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Descreva o produto..."
                            className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-600 dark:text-stone-150 mb-1">Preço (Kz) *</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="150000"
                                className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-stone-600 dark:text-stone-150 mb-1">Categoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                            >
                                <option value="telemovel">Telemóvel</option>
                                <option value="laptop">Laptop</option>
                                <option value="tablet">Tablet</option>
                                <option value="console">Console</option>
                                <option value="smartwatch">Smartwatch</option>
                                <option value="audio">Áudio</option>
                                <option value="acessorios">Acessórios</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-600 dark:text-stone-150 mb-1">Estado do Produto</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                            >
                                <option value="novo">Novo (Nunca usado)</option>
                                <option value="semi-novo">Semi-novo (Pouco uso)</option>
                                <option value="segunda-mao">Segunda Mão (Usado)</option>
                            </select>
                            <p className="text-xs text-stone-400 dark:text-stone-300 mt-1">
                                {getConditionDescription(formData.condition)}
                            </p>
                        </div>
                    </div>
                    
                    {/* LOCALIZAÇÃO */}
                    <div className="border-t border-stone-100 dark:border-stone-600 pt-4 mt-2">
                        <h3 className="font-semibold text-stone-700 dark:text-stone-100 mb-3">📍 Localização</h3>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                            <label className="flex items-center gap-2 text-stone-600 dark:text-stone-150 py-1">
                                <input
                                    type="radio"
                                    value="select"
                                    checked={locationType === 'select'}
                                    onChange={() => setLocationType('select')}
                                    className="text-primary-600 w-4 h-4"
                                />
                                <span>Selecionar Província/Município</span>
                            </label>
                            <label className="flex items-center gap-2 text-stone-600 dark:text-stone-150 py-1">
                                <input
                                    type="radio"
                                    value="manual"
                                    checked={locationType === 'manual'}
                                    onChange={() => setLocationType('manual')}
                                    className="text-primary-600 w-4 h-4"
                                />
                                <span>Digitar manualmente</span>
                            </label>
                        </div>
                        
                        {locationType === 'select' ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-stone-600 dark:text-stone-150 mb-1">Província *</label>
                                    <select
                                        value={formData.province}
                                        onChange={handleProvinceChange}
                                        className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                                    >
                                        <option value="">Selecione uma província</option>
                                        {provinces.map(prov => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {formData.province && municipalities.length > 0 && (
                                    <div>
                                        <label className="block text-stone-600 dark:text-stone-150 mb-1">Município</label>
                                        <select
                                            name="municipality"
                                            value={formData.municipality}
                                            onChange={handleChange}
                                            className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                                        >
                                            <option value="">Selecione um município (opcional)</option>
                                            {municipalities.map(mun => (
                                                <option key={mun} value={mun}>{mun}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-stone-400 dark:text-stone-300 mt-1">Opcional - pode deixar em branco</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-stone-600 dark:text-stone-150 mb-1">Localização *</label>
                                <input
                                    type="text"
                                    name="customLocation"
                                    value={formData.customLocation}
                                    onChange={handleChange}
                                    placeholder="Ex: Luanda, Bairro Popular, Rua 10"
                                    className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                                />
                                <p className="text-xs text-stone-400 dark:text-stone-300 mt-1">Digite sua localização completa</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Fotos */}
                    <div>
                        <label className="block text-stone-600 dark:text-stone-150 mb-1">Fotos (máx 5)</label>
                        <div 
                            className="border-2 border-dashed border-stone-150 dark:border-stone-500 rounded-lg p-5 text-center hover:border-primary-500 active:border-primary-500 transition cursor-pointer dark:hover:border-primary-400"
                            onClick={() => document.getElementById('photoInput').click()}
                        >
                            <p className="text-stone-400 dark:text-stone-300">📸 Toque para adicionar fotos</p>
                            <p className="text-xs text-stone-300 dark:text-stone-400 mt-1">A primeira foto será a principal</p>
                        </div>
                        <input
                            type="file"
                            id="photoInput"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        
                        {photoPreviews.length > 0 && (
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {photoPreviews.map((preview, idx) => (
                                    <div key={idx} className="relative">
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${idx + 1}`} 
                                            className={`w-20 h-20 object-cover rounded-lg border-2 ${idx === 0 ? 'border-primary-500' : 'border-stone-100 dark:border-stone-500'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 active:bg-red-700 shadow-sm"
                                            aria-label="Remover foto"
                                        >
                                            ×
                                        </button>
                                        {idx !== 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setMainPhoto(idx)}
                                                className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[11px] py-1.5 rounded-b-lg"
                                            >
                                                Tornar principal
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {photoPreviews.length === 0 && (
                            <p className="text-xs text-stone-300 dark:text-stone-400 mt-2">Nenhuma foto adicionada</p>
                        )}
                    </div>
                    
                    {/* Contato */}
                    <div className="border-t border-stone-100 dark:border-stone-600 pt-4 mt-2">
                        <h3 className="font-semibold text-stone-600 dark:text-stone-150 mb-3">📞 Como prefere ser contactado?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-stone-600 dark:text-stone-150 mb-1">Método</label>
                                <select
                                    name="contactMethod"
                                    value={formData.contactMethod}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                                >
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="call">Ligação</option>
                                    <option value="both">Ambos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-stone-600 dark:text-stone-150 mb-1">Número *</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handlePhoneChange}
                                    placeholder="923456789"
                                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white ${
                                        contactError ? 'border-red-500' : 'border-stone-150 dark:border-stone-500'
                                    }`}
                                    required
                                />
                                {contactError && (
                                    <p className="text-xs text-red-500 mt-1">{contactError}</p>
                                )}
                                <p className="text-xs text-stone-400 dark:text-stone-300 mt-1">Digite apenas os números. Ex: 923456789</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="block text-stone-600 dark:text-stone-150 mb-1">Horário preferido</label>
                            <input
                                type="text"
                                name="contactHours"
                                value={formData.contactHours}
                                onChange={handleChange}
                                placeholder="Ex: 9h às 18h"
                                className="w-full px-3 py-3 border border-stone-150 dark:border-stone-500 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-stone-600 dark:text-white"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50"
                    >
                        {loading ? 'Publicando...' : 'Publicar Anúncio'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;