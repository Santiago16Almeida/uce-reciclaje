import { Controller, Get, Inject, OnModuleInit, Query, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController implements OnModuleInit {
  private authGrpcService: any;

  constructor(
    @Inject('AUTH_PACKAGE') private readonly authClient: ClientGrpc,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authTcpClient: ClientProxy,
    @Inject('IOT_SERVICE') private readonly iotClient: ClientProxy,
    @Inject('DEPOSIT_SERVICE') private readonly depositClient: ClientProxy,
    @Inject('REWARD_SERVICE') private readonly rewardClient: ClientProxy,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('REPORT_SERVICE') private readonly reportClient: ClientProxy,
    @Inject('HEALTH_SERVICE') private readonly healthClient: ClientProxy,
    @Inject('RECYCLING_SERVICE') private readonly recyclingClient: ClientProxy,
  ) { }

  onModuleInit() {
    this.getGrpcService();
  }

  private getGrpcService() {
    if (!this.authGrpcService) {
      try {
        this.authGrpcService = this.authClient.getService<any>('AuthService');
        console.log('✅ Gateway: Servicio gRPC de Auth cargado');
      } catch (error) {
        console.error('❌ Gateway: Error cargando gRPC:', error.message);
      }
    }
    return this.authGrpcService;
  }

  @Get('auth/login-test')
  async loginTest() {
    try {
      return await firstValueFrom(
        this.authTcpClient.send({ cmd: 'create_session' }, {
          token: 'token123',
          userId: 'user_01',
          role: 'estudiante'
        })
      );
    } catch (error) {
      return { error: 'Error de conexión TCP Auth', details: error.message };
    }
  }

  @Get('sumar-puntos')
  async sumarPuntos(@Query('token') token: string, @Query('puntos') puntos: number, @Query('email') email: string) {
    const service = this.getGrpcService();

    if (!service) {
      throw new UnauthorizedException('Servicio Auth gRPC no disponible');
    }

    try {
      // 1. Validar Token vía gRPC
      const authResponse = await firstValueFrom(service.ValidateToken({ token: token || '' }));

      // LOG DE DEPURACIÓN CLAVE:
      console.log('🔍 Gateway recibió de gRPC:', JSON.stringify(authResponse));

      // Validación mejorada: si llega userId o role, consideramos que es válido aunque 'valid' sea undefined
      const isTokenValid = authResponse && (authResponse.valid === true || authResponse.userId);

      if (!isTokenValid) {
        throw new UnauthorizedException('Token inválido o no reconocido por el servidor');
      }

      if (authResponse.role !== 'estudiante') {
        throw new UnauthorizedException('Acceso denegado: Se requiere rol de estudiante');
      }

      // 2. Sumar puntos vía TCP al User-Service
      const userResponse = await firstValueFrom(
        this.userClient.send({ cmd: 'add_points' }, {
          email: email,
          puntos: Number(puntos)
        })
      );

      return {
        status: 'Success',
        message: 'Puntos procesados correctamente',
        auth: authResponse,
        user_result: userResponse
      };

    } catch (error) {
      console.error('❌ Error en flujo:', error.message);
      // Evitamos reenviar el error 401 si ya es una UnauthorizedException
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Fallo en la operación: ' + error.message);
    }
  }

  @Get('health')
  check() {
    return { status: 'Gateway OK', timestamp: new Date().toISOString() };
  }
}