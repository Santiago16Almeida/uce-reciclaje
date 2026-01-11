import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly redis: Redis;

  constructor() {
    // Conexión directa y robusta
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.redis.on('connect', () => console.log('🚀 Auth-Service: Conectado a Redis directamente'));
  }

  async createSession(token: string, userId: string, role: string) {
    const key = `session:${token}`;
    const data = JSON.stringify({ userId, role });

    // Guardado directo en Redis (TTL de 1 hora)
    await this.redis.set(key, data, 'EX', 3600);

    console.log(`[Redis-Direct] 💾 Guardado: ${key}`);
    return { status: 'success', message: 'Token guardado en Redis' };
  }

  async validateToken(data: any) {
    // Extraemos el token si viene como objeto (gRPC) o string
    const token = typeof data === 'object' ? data.token : data;
    const key = `session:${token}`;

    console.log(`[Redis-Direct] 🔍 Buscando: ${key}`);

    const result = await this.redis.get(key);

    if (!result) {
      console.log(`[Redis-Direct] ❌ No existe la llave: ${key}`);
      return { valid: false, userId: '', role: '' };
    }

    const parsed = JSON.parse(result);
    console.log(`[Redis-Direct] ✅ Encontrado:`, parsed);

    return {
      valid: true,
      userId: parsed.userId,
      role: parsed.role,
    };
  }
}
