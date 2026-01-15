import { Controller, Get, Post, Body, Inject, OnModuleInit, Query, UnauthorizedException, Res } from '@nestjs/common';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

@Controller()
export class AppController implements OnModuleInit {
  private authGrpcService: any;

  //Comunicacion entre microservicios
  constructor(
    @Inject('AUTH_PACKAGE') private readonly authClient: any,
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
    //this.getGrpcService();
    console.log('🚀 Gateway: Bypass gRPC activo para pruebas');
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

  @Post('auth/register')
  async register(@Body() userData: any) {
    try {
      //Crear perfil en User-Service
      await firstValueFrom(
        this.userClient.send({ cmd: 'create_user' }, {
          email: userData.email,
          nombre: userData.nombre,
          role: userData.role
        })
      );

      //Crear credenciales en Auth-Service
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

  @Post('auth/login')
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
    return firstValueFrom(this.userClient.send({ cmd: 'get_user_profile' }, { email }));
  }

  // apps/api-gateway/src/app/app.controller.ts

  // apps/api-gateway/src/app/app.controller.ts

  @Get('sumar')
  async sumarPuntosBypass(@Query('puntos') puntos: string, @Query('email') email: string) {
    try {
      const respuesta = await firstValueFrom(
        this.userClient.send({ cmd: 'add_points' }, { email, puntos: Number(puntos) })
      );
      return respuesta;
    } catch (e) {
      return { status: 'Error' };
    }
  }

  @Get('reportes/mensual')
  async getMonthlyReport() {
    try {
      const usuarios = await firstValueFrom(
        this.userClient.send({ cmd: 'get_all_users' }, {})
      );

      const totalPuntos = usuarios.reduce((sum, u) => sum + (Number(u.puntos) || 0), 0);
      const totalBotellas = Math.floor(totalPuntos / 10);

      const sorted = [...usuarios].sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0));
      const top = sorted[0];

      return {
        totalBotellas,
        ahorroCO2: `${(totalBotellas * 0.05).toFixed(2)}kg`,
        estudianteTop: top ? top.nombre : '---'
      };
    } catch (error) {
      return { totalBotellas: 0, ahorroCO2: '0.00kg', estudianteTop: '---' };
    }
  }

  @Get('rewards')
  async getRewards() {
    return firstValueFrom(this.rewardClient.send({ cmd: 'get_catalog' }, {}));
  }

  @Get('health-check')
  async getHealth() {
    try {
      return await firstValueFrom(this.healthClient.send({ cmd: 'get_status' }, {}));
    } catch (e) {
      return { status: 'Gateway OK', services: 'Sincronizando...' };
    }
  }

  @Post('depositar')
  async registrarDeposito(@Body() data: { email: string, puntos: number }) {
    console.log('[Gateway] Redirigiendo depósito para:', data.email);
    return this.depositClient.send({ cmd: 'depositar_botella' }, data);
  }

  @Get('reportes/exportar')
  async exportarReporte(@Res() res: Response) {
    try {
      const usuarios = await firstValueFrom(
        this.userClient.send({ cmd: 'get_all_users' }, {})
      );

      console.log('[Gateway] Enviando usuarios al Report-Service:', usuarios.length);

      const csvContent = await firstValueFrom(
        this.reportClient.send({ cmd: 'export_csv' }, usuarios)
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_uce.csv');
      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('[Gateway Error Export]', error.message);
      return res.status(500).send('Error al generar el archivo');
    }
  }
}
