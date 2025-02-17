import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PerplexityModule } from './perplexity/perplexity.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [ConfigModule.forRoot(), PerplexityModule, AuthModule],
})
export class AppModule {}
