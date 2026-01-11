import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) { }

  // Kafka necesita conectarse al iniciar el módulo
  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('uce.reciclaje.botella_depositada');
    await this.kafkaClient.connect();
    console.log('[Deposit-Service] Conectado a Kafka');
  }

  enviarEventoReciclaje(email: string, puntos: number) {
    console.log(`[Deposit-Service] Emitiendo evento a Kafka para: ${email}`);

    // Emitimos el evento (esto es asíncrono, no espera respuesta)
    return this.kafkaClient.emit('uce.reciclaje.botella_depositada', {
      userId: email,
      puntos: puntos,
      fecha: new Date().toISOString()
    });
  }
}
