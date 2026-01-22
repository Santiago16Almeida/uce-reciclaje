import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAuth } from './auth.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || '44.223.184.82',
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      username: process.env.POSTGRES_USER || 'uce_admin',
      password: process.env.POSTGRES_PASSWORD || 'uce_password',
      database: process.env.POSTGRES_DB || 'uce_users_db',
      entities: [UserAuth],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserAuth]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }