import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key', // 🔐 환경 변수에서 JWT 시크릿키 가져오기
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
