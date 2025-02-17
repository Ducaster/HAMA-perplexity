import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PerplexityService {
  private apiUrl =
    process.env.PERPLEXITY_API_URL ||
    'https://api.perplexity.ai/chat/completions';
  private apiKey = process.env.PERPLEXITY_API_KEY;

  async askPerplexity(question: string): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'PERPLEXITY_API_KEY가 설정되지 않았습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const requestBody = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in childcare, parenting, baby care, and family life. ' +
            'You only provide answers related to raising children, baby care, parenting tips, ' +
            'educational guidance, child-friendly shopping recommendations, and family well-being. ' +
            'You do NOT answer unrelated topics such as politics, finance, technology, or entertainment. ' +
            'Your answers should be helpful, informative, and practical for parents.',
        },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.2,
      top_p: 0.9,
      search_domain_filter: null,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: null,
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
      response_format: null,
    };

    try {
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // 필요한 데이터만 추출하여 반환
      return {
        content:
          response.data.choices?.[0]?.message?.content || 'No response content',
        citations: response.data.citations || [],
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Perplexity API 요청 실패',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
