import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // MongoDB, no Redis
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Audit, AuditSchema } from './audit.schema';

@Module({
  imports: [
    // MongoDB para Auditoría
    // Usamos el bridge de Docker para conectar con el contenedor de Mongo en la misma instancia
    MongooseModule.forRoot('mongodb://44.223.184.82:27017/uce_audit_db'),

    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
