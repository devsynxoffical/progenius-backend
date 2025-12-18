require('dotenv').config();
const { MongoClient } = require('mongodb');

const SOURCE_URI = 'mongodb+srv://guljan11:JoJokhan90@cluster0.8prbvft.mongodb.net/progenius?retryWrites=true&w=majority&appName=Cluster0';
// Use MONGODB_URI as per Constants.js
const DEST_URI = process.env.MONGODB_URI;

async function migrate() {
    let sourceClient, destClient;

    try {
        if (!DEST_URI) {
            console.error('Available Environment Variables:', Object.keys(process.env));
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('Connecting to Source DB...');
        sourceClient = new MongoClient(SOURCE_URI);
        await sourceClient.connect();
        const sourceDb = sourceClient.db();
        console.log('✅ Connected to Source DB');

        console.log('Connecting to Destination DB...');
        destClient = new MongoClient(DEST_URI);
        await destClient.connect();
        const destDb = destClient.db();
        console.log('✅ Connected to Destination DB');

        // Get list of collections
        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const collectionInfo of collections) {
            const colName = collectionInfo.name;
            console.log(`\nProcessing collection: ${colName}`);

            const sourceCol = sourceDb.collection(colName);
            const destCol = destDb.collection(colName);

            const docs = await sourceCol.find({}).toArray();
            if (docs.length === 0) {
                console.log(`  - Skipping empty collection ${colName}`);
                continue;
            }

            console.log(`  - Found ${docs.length} documents. Migrating...`);

            let successCount = 0;
            let errorCount = 0;

            // Use bulkWrite for efficiency, but we'll use simple loops with upsert for safety against duplicates
            // We upsert based on _id
            const bulkOps = docs.map(doc => ({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: doc },
                    upsert: true
                }
            }));

            if (bulkOps.length > 0) {
                try {
                    const result = await destCol.bulkWrite(bulkOps);
                    console.log(`  - Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);
                } catch (err) {
                    console.error(`  - Bulk write error in ${colName}:`, err.message);
                }
            }
        }

        console.log('\nMigration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (sourceClient) await sourceClient.close();
        if (destClient) await destClient.close();
        process.exit(0);
    }
}

migrate();
