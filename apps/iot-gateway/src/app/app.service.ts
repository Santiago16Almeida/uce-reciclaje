import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) { }

  //Recibe la señal del sensor
  recibirSenalSensor(sensorId: string, pesoDetectado: number) {
    console.log(`[IoT-Gateway] Señal recibida del sensor ${sensorId}: ${pesoDetectado}g`);

    //Reenvía la información al sistema principal vía Kafka
    return this.kafkaClient.emit('uce.reciclaje.botella_depositada', {
      sensor: sensorId,
      peso: pesoDetectado,
      fecha: new Date().toISOString()
    });
  }
}
