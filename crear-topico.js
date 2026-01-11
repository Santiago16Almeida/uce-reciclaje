const { Kafka } = require('kafkajs');

async function crear() {
    const kafka = new Kafka({
        clientId: 'admin-reparador',
        brokers: ['localhost:9092'], // Verifica que este sea tu puerto
    });

    const admin = kafka.admin();
    try {
        await admin.connect();
        console.log('Conectado al servidor Kafka...');

        await admin.createTopics({
            topics: [{
                topic: 'uce.reciclaje.botella_depositada',
                numPartitions: 1,
                replicationFactor: 1,
            }],
        });

        console.log('✅ Tópico "uce.reciclaje.botella_depositada" creado con éxito.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await admin.disconnect();
    }
}

crear();