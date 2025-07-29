import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, streamObject } from 'ai';
import { ChatRequest } from '../interfaces/chat.interface';
import { z } from 'zod';

@Injectable()
export class GeminiService {
  private google;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>(
      'GOOGLE_GENERATIVE_AI_API_KEY',
    );
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }
    this.google = createGoogleGenerativeAI({
      apiKey,
    });
  }

  streamChat(request: ChatRequest) {
    const model = this.google(request.model);

    return streamText({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 12000,
    });
  }

  streamObject<T>(request: ChatRequest & { schema: z.ZodSchema<T> }) {
    const model = this.google(request.model);

    return streamObject({
      model,
      schema: request.schema,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 12000,
    });
  }
}
