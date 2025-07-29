import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AiAgentService } from './ai-agent.service';
import { ChatRequestDto } from './dtos/chat-request.dto';
import { AccessJwtAuthGuard } from '../user/guards/access-jwt-auth.guard';
import { SkipCsrf } from '../common/guards/csrf.guard';

@ApiTags('AI Agent')
@Controller({
  path: 'ai-agent',
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('stream')
  @UseGuards(AccessJwtAuthGuard)
  @SkipCsrf()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream chat with AI agent' })
  streamChat(@Body() chatRequestDto: ChatRequestDto, @Res() res: Response) {
    const result = this.aiAgentService.streamChat(chatRequestDto);

    // For streamText, use pipeTextStreamToResponse
    result.pipeDataStreamToResponse(res);
  }
}
