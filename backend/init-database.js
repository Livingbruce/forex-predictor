import { testConnection, syncDatabase } from './config/database.js';
import { createIndexes } from './models/index.js';

async function initializeDatabase() {
  try {
    console.log('🔌 Testing database connection...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('📊 Synchronizing database schema...');
      await syncDatabase();
      
      console.log('📈 Creating database indexes...');
      await createIndexes();
      
      console.log('✅ Database initialization completed successfully!');
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
  
  process.exit(0);
}

initializeDatabase();
