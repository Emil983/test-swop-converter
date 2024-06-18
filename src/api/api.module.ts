import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { HttpModule } from '@nestjs/axios';
import { Swop } from 'src/swop/swop';

@Module({
  imports: [HttpModule],
  controllers: [ApiController],
  providers: [ApiService, Swop],
})
export class ApiModule {}
