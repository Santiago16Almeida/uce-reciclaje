import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) { }

  // Este método recibe la señal cruda del sensor de la máquina
  recibirSenalSensor(sensorId: string, pesoDetectado: number) {
    console.log(`[IoT-Gateway] Señal recibida del sensor ${sensorId}: ${pesoDetectado}g`);

    // REQUISITO 15: Reenvía la información al sistema principal vía Kafka
    return this.kafkaClient.emit('uce.reciclaje.botella_depositada', {
      sensor: sensorId,
      peso: pesoDetectado,
      fecha: new Date().toISOString()
    });
  }
}
