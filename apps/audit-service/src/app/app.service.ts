import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit } from './audit.schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<Audit>
  ) { }

  async crearLog(data: any) {
    try {
      this.logger.log(`[QA] Intentando registrar auditoría para usuario: ${data.userId}`);

      const nuevoLog = new this.auditModel({
        accion: 'DEPOSITO_BOTELLA',
        usuarioId: data.userId || 'ANONIMO',
        detalles: {
          peso: data.peso,
          puntosAsignados: data.puntos,
          fechaOriginal: data.fecha
        }
      });

      const resultado = await nuevoLog.save();
      this.logger.log(`[DB Mongo] Log guardado con ID: ${resultado._id}`);
      return resultado;
    } catch (error) {
      this.logger.error('Error al conectar o guardar en MongoDB', error.stack);
      throw error;
    }
  }
}
