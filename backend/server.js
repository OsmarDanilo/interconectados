const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const chatService = require('./services/ChatService');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3001;

// ============ CORS ATUALIZADO PARA RENDER ============
const allowedOrigins = [
    'http://localhost:3000',
    'https://interconectados-frontend.onrender.com',
    'https://interconectados-frontend-production.up.railway.app',
    // Adicione o link do seu frontend no Render quando criar
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requisições sem origin (ex: Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('🚫 CORS bloqueado para:', origin);
            callback(null, true); // Em desenvolvimento, permitir todos
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar multer para memória (não salvar no disco)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato não suportado'));
    }
});

// Banco de dados
const DB_PATH = path.join(__dirname, 'data', 'database.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ 
    users: [], 
    products: [], 
    conversations: [], 
    messages: [] 
}, null, 2));

function readData() { return JSON.parse(fs.readFileSync(DB_PATH)); }
function writeData(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    try {
        req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        next();
    } catch { return res.status(401).json({ error: 'Token inválido' }); }
}

// ============ ROTAS DE AUTENTICAÇÃO ============

// REGISTRO (sem tipo de usuário)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Nome, telefone e senha obrigatórios' });
        }
        
        const data = readData();
        if (data.users.find(u => u.phone === phone)) {
            return res.status(400).json({ error: 'Usuário já cadastrado' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            phone,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            totalSales: 0,
            totalProducts: 0
        };
        
        data.users.push(newUser);
        writeData(data);
        
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                phone: newUser.phone,
                type: 'usuario'
            },
            token
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao registrar' });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) return res.status(400).json({ error: 'Identificador e senha obrigatórios' });
        
        const data = readData();
        const user = data.users.find(u => u.phone === identifier || u.name === identifier);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Senha incorreta' });
        
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, type: user.type }, token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// VERIFICAR TOKEN
app.get('/api/auth/verify', authMiddleware, async (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.id === req.userId);
    user ? res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, type: user.type } })
         : res.status(404).json({ error: 'Usuário não encontrado' });
});

// ATUALIZAR PERFIL
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, currentPassword, newPassword } = req.body;
        const data = readData();
        const userIndex = data.users.findIndex(u => u.id === req.userId);
        
        if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const user = data.users[userIndex];
        
        if (newPassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) return res.status(401).json({ error: 'Senha atual incorreta' });
            user.password = await bcrypt.hash(newPassword, 10);
        }
        
        if (name) user.name = name;
        if (phone) user.phone = phone;
        
        writeData(data);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                type: user.type,
                createdAt: user.createdAt,
                totalProducts: user.totalProducts
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// ============ ROTAS DE PRODUTOS ============

// CRIAR PRODUTO (qualquer usuário pode criar)
app.post('/api/products', authMiddleware, upload.array('photos', 5), async (req, res) => {
    try {
        const { title, description, price, category, condition, location, contactMethod, contactNumber, contactHours } = req.body;
        if (!title || !description || !price || !contactNumber) {
            return res.status(400).json({ error: 'Campos obrigatórios' });
        }
        
        const data = readData();
        const user = data.users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Upload para o Cloudinary
        const photos = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'interconectados',
                    transformation: [{ width: 800, height: 800, crop: 'limit' }]
                });
                
                photos.push(result.secure_url);
            }
        }
        
        const newProduct = {
            id: uuidv4(),
            title,
            description,
            price: parseFloat(price),
            category,
            condition,
            location: location || 'Luanda',
            sellerId: user.id,
            sellerName: user.name,
            contactMethod: contactMethod || 'whatsapp',
            contactNumber,
            contactHours: contactHours || '',
            photos,
            createdAt: new Date().toISOString(),
            status: 'active',
            views: 0
        };
        
        data.products.push(newProduct);
        user.totalProducts = (user.totalProducts || 0) + 1;
        writeData(data);
        
        res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar anúncio' });
    }
});

// LISTAR PRODUTOS
app.get('/api/products', async (req, res) => {
    const { category, search, page = 1, limit = 20 } = req.query;
    const data = readData();
    let products = data.products.filter(p => p.status === 'active');
    if (category && category !== 'todos') products = products.filter(p => p.category === category);
    if (search) {
        const term = search.toLowerCase();
        products = products.filter(p => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const start = (page - 1) * limit;
    res.json({ success: true, products: products.slice(start, start + limit), total: products.length, page: parseInt(page), totalPages: Math.ceil(products.length / limit) });
});

// BUSCAR PRODUTO POR ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const data = readData();
        const product = data.products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// PRODUTOS DO VENDEDOR
app.get('/api/products/seller/:sellerId', authMiddleware, async (req, res) => {
    try {
        const data = readData();
        const products = data.products.filter(p => p.sellerId === req.params.sellerId);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Erro ao listar produtos do vendedor:', error);
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
});

// DELETAR PRODUTO
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const data = readData();
        const productIndex = data.products.findIndex(p => p.id === req.params.id);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        const product = data.products[productIndex];
        
        if (product.sellerId !== req.userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }
        
        data.products.splice(productIndex, 1);
        
        const user = data.users.find(u => u.id === req.userId);
        if (user) {
            user.totalProducts = Math.max(0, (user.totalProducts || 1) - 1);
        }
        
        writeData(data);
        
        res.json({ success: true, message: 'Produto removido com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// ESTATÍSTICAS
app.get('/api/stats', async (req, res) => {
    try {
        const data = readData();
        res.json({
            totalProducts: data.products.filter(p => p.status === 'active').length,
            totalUsers: data.users.length,
            totalSellers: data.users.filter(u => u.type === 'vendedor').length
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// ROTA DE TESTE
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

// INCREMENTAR VISUALIZAÇÕES
app.post('/api/products/:id/view', async (req, res) => {
    try {
        const data = readData();
        const product = data.products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        product.views = (product.views || 0) + 1;
        writeData(data);
        
        console.log(`📊 ${product.title} - Nova visualização! Total: ${product.views}`);
        
        res.json({ success: true, views: product.views });
    } catch (error) {
        console.error('Erro ao incrementar visualização:', error);
        res.status(500).json({ error: 'Erro ao registrar visualização' });
    }
});

// ============ ROTAS DO CHAT ============

// Listar conversas do usuário
app.get('/api/chat/conversations', authMiddleware, (req, res) => {
    try {
        const conversations = chatService.getConversations(req.userId);
        res.json({ success: true, conversations });
    } catch (error) {
        console.error('Erro ao listar conversas:', error);
        res.status(500).json({ error: 'Erro ao listar conversas' });
    }
});

// Listar mensagens de uma conversa
app.get('/api/chat/messages/:conversationId', authMiddleware, (req, res) => {
    try {
        const messages = chatService.getMessages(req.params.conversationId, req.userId);
        if (messages === null) {
            return res.status(403).json({ error: 'Não autorizado' });
        }
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Erro ao listar mensagens:', error);
        res.status(500).json({ error: 'Erro ao listar mensagens' });
    }
});

// Enviar mensagem
app.post('/api/chat/messages', authMiddleware, (req, res) => {
    try {
        const { receiverId, content } = req.body;
        
        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Destinatário e conteúdo são obrigatórios' });
        }

        if (receiverId === req.userId) {
            return res.status(400).json({ error: 'Não pode enviar mensagem para si mesmo' });
        }

        const message = chatService.sendMessage(req.userId, receiverId, content);
        
        res.json({ success: true, message });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// Contar mensagens não lidas
app.get('/api/chat/unread-count', authMiddleware, (req, res) => {
    try {
        const count = chatService.getUnreadCount(req.userId);
        res.json({ success: true, count });
    } catch (error) {
        console.error('Erro ao contar mensagens:', error);
        res.status(500).json({ error: 'Erro ao contar mensagens' });
    }
});

// ============ INICIAR SERVIDOR ============
const port = process.env.PORT || 3001;

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📱 Rede local: http://192.168.0.45:${port}`);
    console.log(`🔗 Aguardando conexões...`);
});