import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [PrismaModule, EventModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
