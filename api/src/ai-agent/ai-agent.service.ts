import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClaudeService } from './services/claude.service';
import { GeminiService } from './services/gemini.service';
import { ChatRequestDto, ModelType } from './dtos/chat-request.dto';
import { schemaRegistry, chatResponseSchema } from './schemas';

@Injectable()
export class AiAgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly claudeService: ClaudeService,
    private readonly geminiService: GeminiService,
  ) {}

  streamChat(chatRequestDto: ChatRequestDto) {
    const { model, messages, temperature, maxTokens } = chatRequestDto;

    // Use text streaming for chat interface
    switch (model) {
      case ModelType.CLAUDE_3_5_SONNET:
      case ModelType.CLAUDE_3_OPUS:
      case ModelType.CLAUDE_3_HAIKU:
        return this.claudeService.streamChat({
          model,
          messages,
          temperature,
          maxTokens,
        });

      case ModelType.GEMINI_1_5_PRO:
      case ModelType.GEMINI_1_5_FLASH:
      case ModelType.GEMINI_2_0_FLASH:
      case ModelType.GEMINI_2_5_PRO:
      case ModelType.GEMINI_2_5_FLASH:
        return this.geminiService.streamChat({
          model,
          messages,
          temperature,
          maxTokens,
        });

      default:
        throw new BadRequestException(`Unsupported model: ${model as string}`);
    }
  }

  // Separate method for structured output if needed
  streamStructured(
    chatRequestDto: ChatRequestDto & {
      schemaName?: keyof typeof schemaRegistry;
    },
  ) {
    const { model, messages, temperature, maxTokens, schemaName } =
      chatRequestDto;

    const schema = schemaName ? schemaRegistry[schemaName] : chatResponseSchema;

    if (!schema) {
      throw new BadRequestException(`Unknown schema: ${schemaName}`);
    }

    switch (model) {
      case ModelType.CLAUDE_3_5_SONNET:
      case ModelType.CLAUDE_3_OPUS:
      case ModelType.CLAUDE_3_HAIKU:
        return this.claudeService.streamObject({
          model,
          messages,
          temperature,
          maxTokens,
          schema: schema as any,
        });

      case ModelType.GEMINI_1_5_PRO:
      case ModelType.GEMINI_1_5_FLASH:
      case ModelType.GEMINI_2_0_FLASH:
      case ModelType.GEMINI_2_5_PRO:
      case ModelType.GEMINI_2_5_FLASH:
        return this.geminiService.streamObject({
          model,
          messages,
          temperature,
          maxTokens,
          schema: schema as any,
        });

      default:
        throw new BadRequestException(`Unsupported model: ${model as string}`);
    }
  }
}
