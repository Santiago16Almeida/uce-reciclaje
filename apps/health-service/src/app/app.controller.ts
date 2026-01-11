import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get('status')
  check() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date().toISOString()
    };
  }
}
