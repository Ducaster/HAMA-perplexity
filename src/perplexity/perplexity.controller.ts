import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PerplexityService } from './perplexity.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('perplexity')
export class PerplexityController {
  constructor(private readonly perplexityService: PerplexityService) {}

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  async ask(@Body('question') question: string) {
    return this.perplexityService.askPerplexity(question);
  }
}
