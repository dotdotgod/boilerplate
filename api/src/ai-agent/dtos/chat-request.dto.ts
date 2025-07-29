import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NoHtml } from '../../common/decorators/no-html.decorator';

export enum ModelType {
  // Claude models
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_HAIKU = 'claude-3-haiku',

  // Gemini models
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
  GEMINI_1_5_FLASH = 'gemini-1.5-flash',
  GEMINI_2_0_FLASH = 'gemini-2.0-flash',
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash',
}

export class ChatMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @NoHtml({ message: 'Message content must not contain HTML or script' })
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ enum: ModelType })
  @IsEnum(ModelType)
  model: ModelType;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({ required: false, minimum: 0, maximum: 2, default: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 10000, default: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxTokens?: number;
}
