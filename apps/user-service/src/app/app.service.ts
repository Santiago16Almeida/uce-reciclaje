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
    const usuario = await this.userRepository.findOne({ where: { email } });
    if (!usuario) return { status: 'Error', message: 'No existe' };

    const nuevoPuntaje = Number(usuario.puntos) + Number(puntos);

    usuario.puntos = nuevoPuntaje < 0 ? 0 : nuevoPuntaje;

    const guardado = await this.userRepository.save(usuario);
    console.log(`[User-Service] DB Actualizada: ${email} ahora tiene ${usuario.puntos}`);

    return { ...guardado, status: 'Success' };
  }

  async buscarPorEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error('No existe el usuario');
    return user;
  }

  async findAll() {
    console.log('[User-Service] Extrayendo lista completa para el Admin...');
    return await this.userRepository.find();
  }

}