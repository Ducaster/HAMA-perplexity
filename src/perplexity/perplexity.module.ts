import { Module } from '@nestjs/common';
import { PerplexityService } from './perplexity.service';
import { PerplexityController } from './perplexity.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PerplexityController],
  providers: [PerplexityService],
})
export class PerplexityModule {}
