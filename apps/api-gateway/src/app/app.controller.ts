import { Controller, Get, Post, Body, Inject, OnModuleInit, Query, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller() // <--- VACÍO, porque main.ts ya pone el /api
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
      } catch (error) {
        console.error('❌ Gateway: Error gRPC:', error.message);
      }
    }
    return this.authGrpcService;
  }

  // --- RUTAS DE AUTENTICACIÓN ---

  @Post('auth/register') // Queda como: /api/auth/register
  async register(@Body() userData: any) {
    try {
      // 1. Crear perfil en User-Service
      await firstValueFrom(
        this.userClient.send({ cmd: 'create_user' }, {
          email: userData.email,
          nombre: userData.nombre,
          role: userData.role
        })
      );

      // 2. Crear credenciales en Auth-Service
      const authAccount = await firstValueFrom(
        this.authTcpClient.send({ cmd: 'register_auth' }, {
          email: userData.email,
          password: userData.password,
          role: userData.role
        })
      );

      return authAccount;
    } catch (error) {
      return { status: 'Error', message: 'Servicio Auth/User no disponible' };
    }
  }

  @Post('auth/login') // Queda como: /api/auth/login
  async login(@Body() credentials: any) {
    try {
      return await firstValueFrom(
        this.authTcpClient.send({ cmd: 'login' }, credentials)
      );
    } catch (error) {
      throw new UnauthorizedException('Credenciales inválidas o microservicio Auth caído');
    }
  }

  // --- RUTAS DE DATOS ---

  @Get('usuarios/todos')
  async getAllUsers() {
    return firstValueFrom(this.userClient.send({ cmd: 'get_all_users' }, {}));
  }

  @Get('perfil')
  async getProfile(@Query('email') email: string) {
    console.log('[Gateway] Pidiendo perfil para:', email);
    // Cambiamos 'add_points' por 'get_user_profile'
    return firstValueFrom(this.userClient.send({ cmd: 'get_user_profile' }, { email }));
  }

  @Get('sumar-puntos')
  async sumarPuntos(@Query('token') token: string, @Query('puntos') puntos: number, @Query('email') email: string) {
    const service = this.getGrpcService();
    const auth = await firstValueFrom(service.ValidateToken({ token: token || '' }));
    if (!auth || !auth.valid) throw new UnauthorizedException('Token inválido');

    return firstValueFrom(
      this.userClient.send({ cmd: 'add_points' }, { email, puntos: Number(puntos) })
    );
  }

  @Get('reportes/mensual')
  async getMonthlyReport() {
    return firstValueFrom(this.reportClient.send({ cmd: 'get_monthly' }, {}));
  }

  @Get('rewards')
  async getRewards() {
    return firstValueFrom(this.rewardClient.send({ cmd: 'get_catalog' }, {}));
  }

  @Get('health/status')
  async getHealth() {
    try {
      return await firstValueFrom(this.healthClient.send({ cmd: 'get_status' }, {}));
    } catch (e) {
      return { status: 'Gateway OK', services: 'Sincronizando...' };
    }
  }
}