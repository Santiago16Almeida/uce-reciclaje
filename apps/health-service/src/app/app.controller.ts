import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_status' })
  check() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date().toISOString()
    };
  }
}
