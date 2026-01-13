import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    // Solo conectamos, eliminamos el subscribeToResponseOf que daba error
    await this.kafkaClient.connect();
    console.log('[Deposit-Service] Conectado a Kafka');
  }

  enviarEventoReciclaje(email: string, puntos: number) {
    console.log(`[Deposit-Service] Emitiendo evento a Kafka para: ${email}`);

    // EL NOMBRE DEBE SER IGUAL AL DEL USER SERVICE
    return this.kafkaClient.emit('botella_nueva', {
      email: email, // Usamos email para que el User Service lo encuentre
      puntos: puntos,
      fecha: new Date().toISOString()
    });
  }

  enviarEventoCanje(email: string, puntos: number) {
    console.log(`[Deposit-Service] Solicitando descuento de ${puntos} puntos`);
    return this.kafkaClient.emit('canje_realizado', {
      email,
      puntos,
      fecha: new Date().toISOString()
    });
  }

}