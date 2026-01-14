import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
    console.log('[Deposit-Service] Conectado a Kafka');
  }

  enviarEventoReciclaje(email: string, puntos: number) {
    console.log(`[Deposit-Service] Emitiendo evento a Kafka para: ${email}`);

    return this.kafkaClient.emit('botella_nueva', {
      email: email,
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