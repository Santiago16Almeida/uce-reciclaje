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

    //NOTIFICACIONES vIA N8N
    let premioLogrado = null;

    // Determinamos acorde a los canjes
    if (usuario.puntos >= 100) {
      premioLogrado = "Pase de Parqueo Semanal";
    } else if (usuario.puntos >= 50) {
      premioLogrado = "Bono de Comedor Universitario";
    } else if (usuario.puntos >= 10) {
      premioLogrado = "Vale de 10 Copias Gratis";
    }

    // Si el usuario alcanzó 10 puntos, disparamos n8n
    if (premioLogrado) {
      console.log(`[User-Service] 🚀 Meta alcanzada (${usuario.puntos} pts). Premio: ${premioLogrado}`);

      //URL n8n
      fetch('http://localhost:5678/webhook/alerta-reciclaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante: usuario.nombre,
          email: usuario.email,
          puntosActuales: usuario.puntos,
          premio: premioLogrado,
          facultad: "UCE - Ingeniería",
          fecha: new Date().toLocaleDateString()
        })
      }).catch(err => console.error('⚠️ Error al conectar con n8n:', err.message));
    }
    return { ...guardado, status: 'Success' };
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