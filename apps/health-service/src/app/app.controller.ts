import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices'; // Importante

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_status' }) // Debe coincidir con el Gateway
  check() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date().toISOString()
    };
  }
}
