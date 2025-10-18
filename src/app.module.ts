import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EventModule } from './event/event.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, EventModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
