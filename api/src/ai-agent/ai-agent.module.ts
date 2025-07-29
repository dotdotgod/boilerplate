import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { ClaudeService } from './services/claude.service';
import { GeminiService } from './services/gemini.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiAgentController],
  providers: [AiAgentService, ClaudeService, GeminiService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
