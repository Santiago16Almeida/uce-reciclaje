import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) { }

  obtenerPerfilUsuario(id: string) {
    console.log(`[Gateway Service] TCP -> get_user_profile para: ${id}`);
    return this.userClient.send('get_user_profile', { id }).pipe(
      timeout(5000),
      catchError((err) => this.handleError(err))
    );
  }

  sumarPuntosUsuario(email: string, puntos: number) {
    console.log(`[Gateway Service] TCP -> sumar_puntos_evento para: ${email}`);
    // Enviamos los datos al microservicio
    return this.userClient.send('sumar_puntos_evento', { email, puntos }).pipe(
      timeout(5000),
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: any) {
    console.error('[Gateway Error]', err.message);
    return of({
      status: 'error',
      message: 'El User-Service no respondió.',
      details: err.message
    });
  }
}