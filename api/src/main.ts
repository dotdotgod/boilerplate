import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformerPackage: {
        plainToInstance(cls, plain, options) {
          const result = plainToInstance(cls, plain, {
            ...options,
          });

          if (result && typeof result === 'object') {
            Object.keys(result).forEach((key) => {
              if (result[key] === undefined) {
                delete result[key];
              }
            });
          }

          return result;
        },
        classToPlain(object, options) {
          return instanceToPlain(object, {
            ...options,
          });
        },
      },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(cookieParser());
  app.use(compression());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      strategy: 'excludeAll',
      excludePrefixes: ['_'],
    }),
  );
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('api')
      .setDescription('API description')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('v1/api/docs', app, documentFactory);
  } else {
    app.use(helmet());
  }
  await app.listen(3000);
}

bootstrap();
