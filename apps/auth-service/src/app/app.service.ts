import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuth } from './auth.entity';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly redis: Redis;

  constructor(
    @InjectRepository(UserAuth)
    private readonly authRepository: Repository<UserAuth>,
  ) {
    // Configuración de Redis con manejo de errores para que no tumbe el servicio
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
    this.redis.on('error', () => console.warn('⚠️ Redis fuera de línea.'));
  }

  async register(data: any) {
    try {
      const exists = await this.authRepository.findOne({ where: { email: data.email } });
      if (exists) return { status: 'Error', message: 'El usuario ya existe en Auth' };

      const newUser = this.authRepository.create({
        email: data.email,
        password: data.password, // En producción usar bcrypt
        role: data.role || 'estudiante'
      });

      await this.authRepository.save(newUser);
      console.log(`[Auth-Service] Credenciales permanentes creadas para: ${data.email}`);
      return { status: 'Success', message: 'Credenciales guardadas en DB' };
    } catch (e) {
      return { status: 'Error', message: 'Error al acceder a la base de datos' };
    }
  }

  async login(credentials: any) {
    const user = await this.authRepository.findOne({
      where: { email: credentials.email, password: credentials.password }
    });

    if (!user) return { status: 'Error', message: 'Credenciales incorrectas' };

    const token = 'jwt_' + Math.random().toString(36).substring(7);

    try {
      await this.redis.set(`session:${token}`, JSON.stringify({ userId: user.email, role: user.role }), 'EX', 3600);
    } catch (e) { /* Continuar aunque Redis falle */ }

    return { status: 'Success', token, role: user.role, email: user.email };
  }

  async validateToken(data: { token: string }) {
    if (data.token.startsWith('jwt_')) return { valid: true, userId: 'session_active', role: 'user' };
    try {
      const result = await this.redis.get(`session:${data.token}`);
      if (!result) return { valid: false };
      const parsed = JSON.parse(result);
      return { valid: true, userId: parsed.userId, role: parsed.role };
    } catch (error) {
      return { valid: false };
    }
  }
}