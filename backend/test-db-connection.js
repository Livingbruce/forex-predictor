import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Test database connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'forex_prediction',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    
    // Test creating a simple table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Test table created successfully!');
    
    // Test inserting data
    await sequelize.query(`
      INSERT INTO test_table (name) VALUES ('test_data') ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Test data inserted successfully!');
    
    // Test querying data
    const result = await sequelize.query('SELECT * FROM test_table LIMIT 1;');
    console.log('✅ Test query successful:', result[0]);
    
    await sequelize.close();
    console.log('✅ Database connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
