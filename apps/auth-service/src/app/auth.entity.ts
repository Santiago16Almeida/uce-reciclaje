import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_credentials')
export class UserAuth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'estudiante' })
    role: string;
}