// backend/socket.js
const socketIo = require('socket.io');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://interconectados-frontend-production.up.railway.app'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 Novo cliente conectado:', socket.id);

        // Usuário entra na sala
        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`👤 Usuário ${userId} entrou na sala`);
        });

        // Enviar mensagem em tempo real
        socket.on('send_message', (data) => {
            const { receiverId, message } = data;
            // Enviar para o destinatário
            io.to(`user_${receiverId}`).emit('new_message', message);
        });

        // Usuário digitando
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            io.to(`user_${receiverId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping
            });
        });

        // Desconectar
        socket.on('disconnect', () => {
            console.log('🔌 Cliente desconectado:', socket.id);
        });
    });

    return io;
}

function getIo() {
    return io;
}

module.exports = { initializeSocket, getIo };