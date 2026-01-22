import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;


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

    //NOTIFICACIONES vIA N8N
    let premioLogrado = null;

    // Determinamos acorde a los canjes
    if (usuario.puntos === 100) {
      premioLogrado = "Vale un Parqueadero Preferencial";
    } else if (usuario.puntos === 50) {
      premioLogrado = "Vale un Ticket Comedor UCE";
    } else if (usuario.puntos === 10) {
      premioLogrado = "Vale Copia Gratis Biblioteca";
    }

    // Si el usuario alcanzó 10 puntos, disparamos n8n
    if (premioLogrado && N8N_WEBHOOK_URL) {
      console.log(
        `[User-Service] 🚀 Meta alcanzada (${usuario.puntos} pts). Premio: ${premioLogrado}`
      );

      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estudiante: usuario.nombre,
            email: usuario.email,
            puntosActuales: usuario.puntos,
            premio: premioLogrado,
            facultad: 'UCE - Ingeniería',
            fecha: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error(
          '⚠️ Error al conectar con n8n:',
          error.message || error
        );
      }
    }

    return {
      ...guardado,
      status: 'Success',
    };
  }

  async buscarPorEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error('No existe el usuario');
    return user;
  }

  async findAll() {
    return await this.userRepository.find({
      where: { rol: 'estudiante' },
      order: { puntos: 'DESC' }
    });
  }

}