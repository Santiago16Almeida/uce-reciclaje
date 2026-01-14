import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Auditoría con fecha y hora automática
export class Audit extends Document {
    @Prop({ required: true })
    accion: string; // Ejemplo: "BOTELLA_RECICLADA"

    @Prop({ required: true })
    usuarioId: string;

    @Prop({ type: Object })
    detalles: any; // Guardamos todo en kafka
}

export const AuditSchema = SchemaFactory.createForClass(Audit);