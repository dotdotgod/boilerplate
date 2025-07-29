import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, streamObject } from 'ai';
import { ChatRequest } from '../interfaces/chat.interface';
import { z } from 'zod';

@Injectable()
export class ClaudeService {
  private anthropic;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    this.anthropic = createAnthropic({
      apiKey,
    });
  }

  streamChat(request: ChatRequest) {
    const model = this.anthropic(request.model);

    return streamText({
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2000,
    });
  }

  streamObject<T>(request: ChatRequest & { schema: z.ZodSchema<T> }) {
    const model = this.anthropic(request.model);

    return streamObject({
      model,
      schema: request.schema,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2000,
    });
  }
}
