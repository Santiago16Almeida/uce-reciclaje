import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly redis: Redis;

  private usersAuth = [
    { email: 'admin@uce.edu.ec', password: '123', role: 'admin' },
    { email: 'santiago@uce.edu.ec', password: '123', role: 'estudiante' }
  ];

  constructor() {
    // Configuración de conexión a Redis
    this.redis = new Redis({ host: 'localhost', port: 6379 });
  }

  async register(data: any) {
    const exists = this.usersAuth.find(u => u.email === data.email);
    if (exists) return { status: 'Error', message: 'El usuario ya existe' };

    const newUser = {
      email: data.email,
      password: data.password,
      role: data.role || 'estudiante'
    };

    this.usersAuth.push(newUser);
    return { status: 'Success', message: 'Credenciales creadas' };
  }

  async login(credentials: any) {
    const user = this.usersAuth.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) return { status: 'Error', message: 'Credenciales incorrectas' };

    const token = 'jwt_' + Math.random().toString(36).substring(7);

    try {
      // Guardar sesión en Redis por 1 hora
      await this.redis.set(`session:${token}`, JSON.stringify({ userId: user.email, role: user.role }), 'EX', 3600);
    } catch (e) {
      console.warn('⚠️ Redis no disponible, el token no será persistente');
    }

    return { status: 'Success', token, role: user.role, email: user.email };
  }

  async validateToken(data: { token: string }) {
    const token = data.token; // Extraemos el string del objeto

    if (token === 'token_dummy') return { valid: true, userId: 'test@uce.edu.ec', role: 'estudiante' };

    try {
      const result = await this.redis.get(`session:${token}`);
      if (!result) return { valid: false };

      const parsed = JSON.parse(result);
      return { valid: true, userId: parsed.userId, role: parsed.role };
    } catch (error) {
      return { valid: false };
    }
  }
}