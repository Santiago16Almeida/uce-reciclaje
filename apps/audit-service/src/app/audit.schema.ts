import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // REQUISITO 6: Registro de fecha y hora
export class Audit extends Document {
    // Cambia esto:
    @Prop({ type: String, required: true }) // <-- Agrega el tipo aquí
    accion: string;

    @Prop({ type: String, required: true }) // <-- Agrega el tipo aquí
    usuarioId: string;

    @Prop({ type: Date, default: Date.now }) // <-- Esto también ayuda
    fecha: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);