import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';

import { commonService } from './common/common.service';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string()
          .regex(/^[0-9]+$/)
          .required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        BASE_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().email().required(),
        SMTP_PASS: Joi.string().required(),
        ANTHROPIC_API_KEY: Joi.string().optional(),
        GOOGLE_GENERATIVE_AI_API_KEY: Joi.string().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => commonService.getTypeOrmConfig(),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        const dataSource = await new DataSource(options).initialize();
        return addTransactionalDataSource(dataSource);
      },
    }),
    UserModule,
    MailModule,
    AiAgentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
