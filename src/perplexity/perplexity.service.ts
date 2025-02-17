import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';

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
            '답변 텍스트에 강조 표시를 사용하지 마세요.' +
            '답변 텍스트에 * 등의 특수문자를 사용하지 마세요.',
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

      const citations = response.data.citations || [];

      // 각 citation URL에서 제목과 요약 가져오기
      const citationPreviews = await this.fetchCitationsPreview(citations);

      return {
        content:
          response.data.choices?.[0]?.message?.content || 'No response content',
        citations: citationPreviews, // 미리보기 정보를 추가한 citations 반환
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Perplexity API 요청 실패',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // URL에서 제목, 설명, 대표 이미지를 가져오는 함수
  private async fetchCitationsPreview(urls: string[]) {
    const fetchPagePreview = async (url: string) => {
      try {
        const { data } = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(data);

        const title = $('title').text().trim() || '제목 없음';
        const description =
          $('meta[name="description"]').attr('content')?.trim() ||
          $('meta[property="og:description"]').attr('content')?.trim() ||
          '설명 없음';

        const image =
          $('meta[property="og:image"]').attr('content') ||
          $('meta[name="twitter:image"]').attr('content') ||
          'https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg'; // 기본 썸네일

        return { url, title, description, image };
      } catch (error) {
        return {
          url,
          title: '불러오기 실패',
          description: '페이지를 가져올 수 없습니다.',
          image:
            'https://t4.ftcdn.net/jpg/07/91/22/59/360_F_791225927_caRPPH99D6D1iFonkCRmCGzkJPf36QDw.jpg',
        };
      }
    };

    // 병렬 요청을 보내되, 모든 요청이 실패해도 계속 진행
    const results = await Promise.allSettled(urls.map(fetchPagePreview));

    return results.map((res) =>
      res.status === 'fulfilled'
        ? res.value
        : {
            url: res.reason?.url || '알 수 없음',
            title: '불러오기 실패',
            description: '페이지를 가져올 수 없습니다.',
            image: 'https://example.com/default-thumbnail.jpg',
          },
    );
  }
}
