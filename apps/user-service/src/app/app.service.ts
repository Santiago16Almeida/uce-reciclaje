import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createUser(data: any) {
    const existing = await this.userRepository.findOne({ where: { email: data.email } });
    if (existing) return existing;

    const user = this.userRepository.create({
      nombre: data.nombre,
      email: data.email,
      rol: data.role || 'estudiante',
      puntos: 0
    });
    return await this.userRepository.save(user);
  }

  async sumarPuntos(email: string, puntos: number) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return { status: 'Error', message: 'Usuario no encontrado' };

    // Si es admin, no suma puntos
    if (user.rol === 'admin') return user;

    user.puntos += puntos;
    return await this.userRepository.save(user);
  }

  async obtenerTodosParaAuditoria() {
    return await this.userRepository.find({
      order: { puntos: 'DESC' }
    });
  }

  async buscarPorEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error('No existe el usuario');
    return user; // Esto devuelve el objeto con id, nombre, email y PUNTOS
  }

}