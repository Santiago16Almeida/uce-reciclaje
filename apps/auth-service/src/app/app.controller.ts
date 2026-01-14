import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    const result = await this.appService.validateToken(data);
    return {
      valid: result.valid,
      userId: result.userId || '',
      role: result.role || ''
    };
  }

  @MessagePattern({ cmd: 'register_auth' })
  async register(@Payload() data: any) {
    return await this.appService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any) {
    return await this.appService.login(data);
  }
}