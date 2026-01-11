import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // REQUISITO 6: Auditoría con fecha y hora automática
export class Audit extends Document {
    @Prop({ required: true })
    accion: string; // Ejemplo: "BOTELLA_RECICLADA"

    @Prop({ required: true })
    usuarioId: string;

    @Prop({ type: Object })
    detalles: any; // Guardamos todo el objeto que vino de Kafka
}

export const AuditSchema = SchemaFactory.createForClass(Audit);