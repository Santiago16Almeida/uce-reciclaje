import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ModuleRef } from '@nestjs/core';

@Controller()
export class AppController implements OnModuleInit {
  // Usamos inyección de propiedad, que es más resistente que el constructor
  @Inject(AppService)
  private appService: AppService;

  constructor(private moduleRef: ModuleRef) { }

  onModuleInit() {
    // Si la inyección de arriba falló, lo buscamos a mano al iniciar
    if (!this.appService) {
      this.appService = this.moduleRef.get(AppService, { strict: false });
    }
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    console.log(`[Auth-Service] gRPC: Validando -> ${data.token}`);
    return await this.appService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'create_session' })
  async createSession(@Payload() data: { token: string; userId: string; role: string }) {
    console.log(`[Auth-Service] TCP: Creando sesión para -> ${data.userId}`);

    // Aseguramos que el servicio exista
    const service = this.appService || this.moduleRef.get(AppService, { strict: false });

    if (!service) {
      console.error('❌ Error fatal: AppService no pudo ser cargado');
      throw new Error('Servicio no inicializado');
    }

    return await service.createSession(data.token, data.userId, data.role);
  }
}