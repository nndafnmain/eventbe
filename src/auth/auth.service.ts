import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private jwtSecret = process.env.JWT_SECRET || 'MYSECRET';
  private jwtExpires = process.env.JWT_EXPIRES_IN || '1d';

  async register(data: RegisterDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('Email has been used!');
    }

    let referralCode: string;
    let userRole: string = 'CUSTOMER';

    if (data.role) {
      userRole = data.role;
    }

    while (true) {
      referralCode = uuidv4().slice(0, 6);
      const codeExists = await this.prisma.user.findUnique({
        where: {
          referralCode,
        },
      });
      if (!codeExists) {
        break;
      }
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        referralCode,
        role: userRole as any,
      },
      select: {
        username: true,
        email: true,
        referralCode: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  async login(data: LoginDto) {
    const emailCorrect = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!emailCorrect) {
      throw new UnauthorizedException('Credential invalid!');
    }

    const passCorrect = await bcrypt.compare(
      data.password,
      emailCorrect.password,
    );

    if (!passCorrect) {
      throw new UnauthorizedException('Invalid credential!');
    }

    const payload = {
      id: emailCorrect.id,
      username: emailCorrect.username,
      referralCode: emailCorrect.referralCode,
      email: emailCorrect.email,
      role: emailCorrect.role,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpires as any,
    });

    return {
      access_token: token,
      user: {
        id: emailCorrect.id,
        username: emailCorrect.username,
        referralCode: emailCorrect.referralCode,
        email: emailCorrect.email,
        role: emailCorrect.role,
      },
    };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token!');
    }
  }
}
