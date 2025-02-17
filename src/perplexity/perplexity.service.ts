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
            '당신은 육아, 부모 교육, 아이 돌봄, 육아 쇼핑 전문가입니다. ' +
            '사용자의 질문에 대해 한국어로만 답변하며, 부모에게 실용적이고 신뢰할 수 있는 정보를 제공합니다. ' +
            '오직 육아, 자녀 교육, 가족 생활, 아이 관련 쇼핑 추천에 대해서만 답변하세요. ' +
            "정치, 경제, 금융, 연예, 기술 등의 주제는 답변하지 않으며, 질문이 관련이 없으면 '죄송합니다. 저는 육아 및 부모 관련 질문에만 답변할 수 있습니다.'라고 답변하세요. " +
            '또한 답변은 간결하고, 이해하기 쉽게 작성해 주세요.' +
            '답변은 한국어로 작성해 주세요.' +
            '답변은 최대한 짧게 작성해 주세요.' +
            '답변은 최대한 쉽게 작성해 주세요.' +
            '결과에서 블로그는 최대한 제외해 주세요.' +
            '상품을 찾아야 한다면 Coupang.com에서 주로 찾아주세요' +
            '답변 텍스트에 강조 표시를 사용하지 마세요.',
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
