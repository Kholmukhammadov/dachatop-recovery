import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MetaOptionEnum } from './posts/models/post.model';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const findMe =
      Object.keys(MetaOptionEnum)[
        Object.values(MetaOptionEnum).indexOf('_thumbnail_id')
      ];
    process.chdir('../../');
    return process.cwd();
  }
}
