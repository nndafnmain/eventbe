import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create() {}

  async findMany() {}

  async findOne(id: string) {
    const event = await this.prisma.event.findFirst({
      select: {
        title: true,
        description: true,
      },
      where: {
        id: id,
      },
    });

    return event;
  }
}
