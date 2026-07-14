import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { FiMessageCircle } from 'react-icons/fi';

const Chat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchConversations();
            fetchUnreadCount();
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/chat/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Erro ao buscar não lidas:', error);
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        if (conversation.unreadCount > 0) {
            setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Mensagens</h1>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex h-[600px]">
                    <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700">
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?.id}
                            onSelect={handleSelectConversation}
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        {selectedConversation ? (
                            <ChatWindow
                                conversation={selectedConversation}
                                userId={user?.id}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FiMessageCircle size={48} className="mb-4" />
                                <p>Selecione uma conversa para começar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;