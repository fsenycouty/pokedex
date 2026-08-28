import 'dotenv/config';
import sequelize from '../config/sequelize.client.js';
// On importe tous nos modèles
import '../models/index.js';

async function syncDb() {

    try {
        await sequelize.sync({alter: true});
        console.log('✅ Database sync successfull');
    } catch (error) {
        console.error('❌ Error synchronizing database : ', error);
    } finally {
        await sequelize.close();
    }
}

syncDb();