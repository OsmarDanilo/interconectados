const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const DB_PATH = path.join(__dirname, 'data', 'database.json');
const data = JSON.parse(fs.readFileSync(DB_PATH));

async function migrate() {
    try {
        // Migrar usuários
        for (const user of data.users) {
            await pool.query(
                `INSERT INTO users (id, name, phone, password, created_at, total_products)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO NOTHING`,
                [user.id, user.name, user.phone, user.password || '', user.createdAt, user.totalProducts || 0]
            );
            console.log(`✅ Usuário ${user.name} migrado`);
        }

        // Migrar produtos
        for (const product of data.products) {
            await pool.query(
                `INSERT INTO products (id, title, description, price, category, condition, location, 
                                       seller_id, seller_name, contact_method, contact_number, photos, 
                                       views, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    product.id, product.title, product.description, product.price,
                    product.category, product.condition, product.location,
                    product.sellerId, product.sellerName, product.contactMethod,
                    product.contactNumber, product.photos || [],
                    product.views || 0, product.status || 'active', product.createdAt
                ]
            );
            console.log(`✅ Produto ${product.title} migrado`);
        }

        console.log('🎉 Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
    process.exit();
}

migrate();