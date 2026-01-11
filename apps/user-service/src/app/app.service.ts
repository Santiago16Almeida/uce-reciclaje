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

  async getProfile(email: string) {
    console.log(`[User-Service] Buscando o creando perfil para: ${email}`);

    try {
      let usuario = await this.userRepository.findOne({ where: { email } });

      // Si no existe, lo creamos automáticamente
      if (!usuario) {
        console.log(`[User-Service] Usuario nuevo detectado. Registrando en Postgres...`);
        usuario = this.userRepository.create({
          nombre: 'Santiago Estudiante',
          email: email,
          puntos: 0,
          rol: 'estudiante',
        });
        await this.userRepository.save(usuario);
      }

      return usuario;
    } catch (error) {
      console.error('[User-Service] Error en BD:', error);
      throw error;
    }
  }

  async sumarPuntos(email: string, puntosNuevos: number) {
    // 1. Aseguramos que el usuario exista (lo busca o lo crea)
    const usuario = await this.getProfile(email);

    // 2. Sumamos los puntos
    const puntosAnteriores = Number(usuario.puntos) || 0;
    usuario.puntos = puntosAnteriores + Number(puntosNuevos);

    // 3. Guardamos en PostgreSQL
    await this.userRepository.save(usuario);

    // LOG DE AUDITORÍA PROFESIONAL
    console.log('================ AUDITORÍA DE RECICLAJE ================');
    console.log(`FECHA: ${new Date().toLocaleString()}`);
    console.log(`USUARIO: ${usuario.nombre} (${email})`);
    console.log(`TRANSACCIÓN: +${puntosNuevos} puntos`);
    console.log(`BALANCE: ${puntosAnteriores} -> ${usuario.puntos}`);
    console.log('========================================================');

    return usuario;
  }
}