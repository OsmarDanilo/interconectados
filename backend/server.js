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

// ============ CORS ============
// ============ CORS ============
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('🚫 CORS bloqueado para:', origin);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar multer para memória
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato não suportado'));
    }
});

// ============ BANCO DE DADOS (Supabase ou JSON) ============
const USE_SUPABASE = process.env.DATABASE_URL && process.env.USE_SUPABASE === 'true';

// Tentar conectar ao Supabase se configurado
let supabasePool = null;
if (USE_SUPABASE) {
    try {
        const { Pool } = require('pg');
        supabasePool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        supabasePool.connect().then(() => {
            console.log('✅ Conectado ao Supabase!');
        }).catch(err => {
            console.error('❌ Erro ao conectar ao Supabase:', err);
            supabasePool = null;
        });
    } catch (error) {
        console.error('❌ Erro ao configurar Supabase:', error);
        supabasePool = null;
    }
}

// === Banco JSON (fallback) ===
const DB_PATH = path.join(__dirname, 'data', 'database.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ 
        users: [], 
        products: [], 
        conversations: [], 
        messages: [] 
    }, null, 2));
}

function readData() { return JSON.parse(fs.readFileSync(DB_PATH)); }
function writeData(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// === Funções do banco de dados ===
async function dbQuery(text, params) {
    if (USE_SUPABASE && supabasePool) {
        try {
            const result = await supabasePool.query(text, params);
            return result;
        } catch (error) {
            console.error('❌ Erro no Supabase:', error);
            // Fallback para JSON
            return null;
        }
    }
    return null;
}

// ============ MIDDLEWARE ============
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    try {
        req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        next();
    } catch { return res.status(401).json({ error: 'Token inválido' }); }
}

// ============ ROTAS DE AUTENTICAÇÃO ============

// REGISTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Nome, telefone e senha obrigatórios' });
        }
        
        // Tenta usar Supabase primeiro
        if (USE_SUPABASE && supabasePool) {
            const existingUser = await dbQuery('SELECT * FROM users WHERE phone = $1', [phone]);
            if (existingUser && existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Usuário já cadastrado' });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            
            await dbQuery(
                `INSERT INTO users (id, name, phone, password, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [userId, name, phone, hashedPassword]
            );
            
            const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
            
            return res.json({
                success: true,
                user: { id: userId, name, phone, type: 'usuario' },
                token
            });
        }
        
        // Fallback: JSON
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
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identificador e senha obrigatórios' });
        }
        
        // Tenta Supabase
        if (USE_SUPABASE && supabasePool) {
            const result = await dbQuery(
                'SELECT * FROM users WHERE phone = $1 OR name = $1',
                [identifier]
            );
            
            if (result && result.rows.length > 0) {
                const user = result.rows[0];
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    return res.status(401).json({ error: 'Senha incorreta' });
                }
                
                const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                
                return res.json({
                    success: true,
                    user: { id: user.id, name: user.name, phone: user.phone, type: user.type || 'usuario' },
                    token
                });
            }
        }
        
        // Fallback: JSON
        const data = readData();
        const user = data.users.find(u => u.phone === identifier || u.name === identifier);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }
        
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            user: { id: user.id, name: user.name, phone: user.phone, type: user.type || 'usuario' },
            token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// VERIFICAR TOKEN
app.get('/api/auth/verify', authMiddleware, async (req, res) => {
    try {
        if (USE_SUPABASE && supabasePool) {
            const result = await dbQuery('SELECT * FROM users WHERE id = $1', [req.userId]);
            if (result && result.rows.length > 0) {
                const user = result.rows[0];
                return res.json({
                    success: true,
                    user: { id: user.id, name: user.name, phone: user.phone, type: user.type || 'usuario' }
                });
            }
        }
        
        const data = readData();
        const user = data.users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json({
            success: true,
            user: { id: user.id, name: user.name, phone: user.phone, type: user.type || 'usuario' }
        });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ error: 'Erro ao verificar token' });
    }
});

// ============ ROTAS DE PRODUTOS ============

// CRIAR PRODUTO
app.post('/api/products', authMiddleware, upload.array('photos', 5), async (req, res) => {
    try {
        const { title, description, price, category, condition, location, contactMethod, contactNumber, contactHours } = req.body;
        if (!title || !description || !price || !contactNumber) {
            return res.status(400).json({ error: 'Campos obrigatórios' });
        }
        
        // Upload para Cloudinary
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
        
        const productId = uuidv4();
        
        // Tenta Supabase
        if (USE_SUPABASE && supabasePool) {
            await dbQuery(
                `INSERT INTO products (id, title, description, price, category, condition, location,
                                       seller_id, seller_name, contact_method, contact_number, photos, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
                [productId, title, description, parseFloat(price), category, condition, location || 'Luanda',
                 req.userId, req.body.sellerName || 'Usuário', contactMethod || 'whatsapp', contactNumber, photos]
            );
            
            return res.json({ success: true, product: { id: productId, title, description, price, category, condition, location, photos } });
        }
        
        // Fallback: JSON
        const data = readData();
        const user = data.users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const newProduct = {
            id: productId,
            title,
            description,
            price: parseFloat(price),
            category,
            condition,
            location: location || 'Luanda',
            sellerId: user.id,
            sellerName: user.name || 'Usuário',
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
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        
        // Tenta Supabase
        if (USE_SUPABASE && supabasePool) {
            let queryText = 'SELECT * FROM products WHERE status = $1';
            let params = ['active'];
            let paramIndex = 2;
            
            if (category && category !== 'todos') {
                queryText += ` AND category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }
            
            if (search) {
                queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }
            
            queryText += ' ORDER BY created_at DESC';
            
            const start = (page - 1) * limit;
            queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, start);
            
            const result = await dbQuery(queryText, params);
            const countResult = await dbQuery('SELECT COUNT(*) FROM products WHERE status = $1', ['active']);
            
            if (result && countResult) {
                return res.json({
                    success: true,
                    products: result.rows,
                    total: parseInt(countResult.rows[0].count),
                    page: parseInt(page),
                    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
                });
            }
        }
        
        // Fallback: JSON
        const data = readData();
        let products = data.products.filter(p => p.status === 'active');
        if (category && category !== 'todos') {
            products = products.filter(p => p.category === category);
        }
        if (search) {
            const term = search.toLowerCase();
            products = products.filter(p => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
        }
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const start = (page - 1) * limit;
        res.json({
            success: true,
            products: products.slice(start, start + limit),
            total: products.length,
            page: parseInt(page),
            totalPages: Math.ceil(products.length / limit)
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
});

// BUSCAR PRODUTO POR ID
app.get('/api/products/:id', async (req, res) => {
    try {
        if (USE_SUPABASE && supabasePool) {
            const result = await dbQuery('SELECT * FROM products WHERE id = $1', [req.params.id]);
            if (result && result.rows.length > 0) {
                return res.json({ success: true, product: result.rows[0] });
            }
        }
        
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
        if (USE_SUPABASE && supabasePool) {
            const result = await dbQuery('SELECT * FROM products WHERE seller_id = $1', [req.params.sellerId]);
            if (result) {
                return res.json({ success: true, products: result.rows });
            }
        }
        
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
        if (USE_SUPABASE && supabasePool) {
            const result = await dbQuery('SELECT * FROM products WHERE id = $1 AND seller_id = $2', [req.params.id, req.userId]);
            if (result && result.rows.length === 0) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            await dbQuery('DELETE FROM products WHERE id = $1', [req.params.id]);
            return res.json({ success: true, message: 'Produto removido com sucesso' });
        }
        
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
        if (USE_SUPABASE && supabasePool) {
            const productsResult = await dbQuery('SELECT COUNT(*) FROM products WHERE status = $1', ['active']);
            const usersResult = await dbQuery('SELECT COUNT(*) FROM users');
            const sellersResult = await dbQuery('SELECT COUNT(*) FROM users WHERE type = $1', ['vendedor']);
            
            if (productsResult && usersResult && sellersResult) {
                return res.json({
                    totalProducts: parseInt(productsResult.rows[0].count),
                    totalUsers: parseInt(usersResult.rows[0].count),
                    totalSellers: parseInt(sellersResult.rows[0].count)
                });
            }
        }
        
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
        if (USE_SUPABASE && supabasePool) {
            await dbQuery('UPDATE products SET views = views + 1 WHERE id = $1', [req.params.id]);
            const result = await dbQuery('SELECT views FROM products WHERE id = $1', [req.params.id]);
            if (result && result.rows.length > 0) {
                return res.json({ success: true, views: result.rows[0].views });
            }
        }
        
        const data = readData();
        const product = data.products.find(p => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        product.views = (product.views || 0) + 1;
        writeData(data);
        res.json({ success: true, views: product.views });
    } catch (error) {
        console.error('Erro ao incrementar visualização:', error);
        res.status(500).json({ error: 'Erro ao registrar visualização' });
    }
});

// ============ ROTAS DO CHAT ============
// (Manter as mesmas rotas do chat - elas usam o chatService que usa JSON)

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