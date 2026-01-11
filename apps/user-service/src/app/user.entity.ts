import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' }) // <--- OBLIGATORIO PARA POSTGRES
    nombre: string;

    @Column({ type: 'varchar', unique: true }) // <--- OBLIGATORIO PARA POSTGRES
    email: string;

    @Column({ type: 'varchar', default: 'estudiante' }) // <--- OBLIGATORIO PARA POSTGRES
    rol: 'estudiante' | 'admin';

    @Column({ type: 'integer', default: 0 }) // <--- OBLIGATORIO PARA POSTGRES
    puntos: number;

    @Column({ type: 'boolean', default: true }) // <--- OBLIGATORIO PARA POSTGRES
    estaActivo: boolean;
}