import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed',
      );
    }

    const token = authHeader.split(' ')[1]; // Bearer 토큰에서 실제 토큰 부분만 추출
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your_secret_key', // 🔐 환경 변수에서 JWT 시크릿키 가져옴
      });
      request.user = decoded; // 요청 객체에 유저 정보를 추가
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
