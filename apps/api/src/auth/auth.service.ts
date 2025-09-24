/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.createLocalUser({
      email,
      name,
      passwordHash,
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    await this.saveRefreshHash(user.id, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    await this.saveRefreshHash(user.id, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const record = await this.prisma.refreshToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new UnauthorizedException('Refresh not found');

    const match = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!match) throw new UnauthorizedException('Invalid refresh');

    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    await this.saveRefreshHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET')!;
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    const accessExp = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExp =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub, email, role },
        { secret: accessSecret, expiresIn: accessExp },
      ),
      this.jwt.signAsync(
        { sub, email, role },
        { secret: refreshSecret, expiresIn: refreshExp },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshHash(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
  }
}
