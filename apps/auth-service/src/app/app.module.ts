import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAuth } from './auth.entity';

@Module({
  imports: [
    // Agregamos la conexión que le faltaba (igual a la de User pero con su BD)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433, // Asegúrate que sea el mismo puerto del Docker
      username: 'uce_admin',
      password: 'uce_password',
      database: 'uce_users_db', // O la base de datos que use Auth
      entities: [UserAuth],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserAuth]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }