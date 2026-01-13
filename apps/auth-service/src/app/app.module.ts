import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAuth } from './auth.entity';

@Module({
  imports: [
    //Conexion con la DB
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433, //Puerto Docker
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