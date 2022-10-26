import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app
    .setGlobalPrefix('api', {
      exclude: [
        { method: RequestMethod.GET, path: '/files/:name' }
      ]
    })
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        // TODO: new exception to handle this property
      }),
    )
    .use(helmet())
    .enableCors();

  const config = new DocumentBuilder()
    .setTitle('Teslo Shop API')
    .setDescription('Teslo Shop RESTFul API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Teslo Shop API DOCS',
  });

  await app.listen(+process.env.PORT);
}
bootstrap();
