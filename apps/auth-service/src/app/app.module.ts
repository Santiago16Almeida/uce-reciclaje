import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAuth } from './auth.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // En AWS usamos el bridge de Docker para llegar al contenedor de Postgres
      host: process.env.DB_HOST || '172.17.0.1',
      port: parseInt(process.env.DB_PORT!) || 5433,
      username: 'uce_admin',
      password: 'uce_password',
      database: 'uce_users_db',
      entities: [UserAuth],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserAuth]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }