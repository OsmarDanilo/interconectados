import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale/pt';

const ConversationList = ({ conversations, selectedId, onSelect, onNewMessage }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Conversas</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <p>Nenhuma conversa ainda</p>
                        <p className="text-sm mt-1">Quando começar a conversar, aparecerá aqui</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv)}
                                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                                    selectedId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {conv.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                                {conv.otherUser?.name || 'Usuário'}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: pt }) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {conv.lastMessage || 'Nenhuma mensagem'}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-blue-500 text-white text-xs min-w-[20px] px-2 py-1 rounded-full text-center flex-shrink-0 ml-2">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;