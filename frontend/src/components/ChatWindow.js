import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ conversation, userId, onNewMessage }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (conversation) {
            fetchMessages();
            inputRef.current?.focus();
        }
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/chat/messages/${conversation.id}`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        try {
            const response = await api.post('/chat/messages', {
                receiverId: conversation.otherUser.id,
                content
            });

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.message]);
                if (onNewMessage) {
                    onNewMessage(response.data.message);
                }
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                Carregando mensagens...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Cabeçalho */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    <FiArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {conversation.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                        {conversation.otherUser?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-400">Online</p>
                </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p>Nenhuma mensagem ainda</p>
                        <p className="text-sm mt-1">Envie uma mensagem para começar</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === userId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${
                                        isOwn
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${
                                        isOwn ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                        {format(new Date(msg.createdAt), 'HH:mm', { locale: pt })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                    <FiSend size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;