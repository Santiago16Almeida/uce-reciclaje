import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 50, default: 'estudiante' })
    rol: string; // 'estudiante' | 'admin'

    @Column({ type: 'integer', default: 0 })
    puntos: number;

    @Column({ type: 'boolean', default: true })
    estaActivo: boolean;
}