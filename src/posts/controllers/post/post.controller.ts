import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UploadedFiles,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Wp_posts } from '../../entities/wp_posts.entity';
import { MapService } from '../../services/map/map.service';
import { PostService } from '../../services/post/post.service';
import { PostMetaService } from '../../services/post-meta/post-meta.service';
import { Wp_postmeta } from '../../entities/wp_postmeta.entity';
import { PostModel } from '../../models/post.model';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AbstarctModel } from '../../models/abstarct.model';
import { Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { PostMetaDTO } from '../../models/postMeta.DTO';
import { AuthGuard } from '@nestjs/passport';
import { Wp_term_taxonomy } from '../../entities/wp_term_taxonomy.entity';
import { TermsService } from '../../services/terms/terms.service';
import { CreatePostDTO } from '../../models/createPost.DTO';

@Controller('post')
@UseGuards(AuthGuard())
export class PostController {
  constructor(
    private mapService: MapService,
    private postService: PostService,
    private postMetaService: PostMetaService,
    private termService: TermsService,
  ) {}

  @Get('/authorPosts')
  async GetAuthorPosts(
    @Query('authorId') authorId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<AbstarctModel<Wp_posts>> {
    limit = limit > 100 ? 100 : limit;
    return this.postService.getAuthorPosts(authorId, {
      page,
      limit,
      route: 'http://cats.com/cats',
    });
  }

  @Get('/termTaxonomy')
  async GetTermTaxonomy(
    @Query('quantity') quantity: number,
  ): Promise<Wp_term_taxonomy[]> {
    return this.termService.getAllTaxonomy(quantity);
  }

  @Post('createPost')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination:
          process.cwd() +
          `/uploads/${new Date().getFullYear()}/${new Date()
            .toISOString()
            .slice(5, 7)}`,
        filename: (req, file, cb) => {
          const fileName: string =
            'IMG_' +
            `${new Date().getFullYear()}${new Date()
              .toISOString()
              .slice(5, 10)
              .replace('-', '')}_` +
            path.parse(file.originalname).name.replace(/\s/g, '');
          const extention: string = path.parse(file.originalname).ext;
          cb(null, `${fileName}${extention}`);
        },
      }),
    }),
  )
  // eslint-disable-next-line @typescript-eslint/ban-types
  async createPost(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() payload,
  ): Promise<PostModel> {
    return this.postService.preparePostParentPayload({
      post_parent: JSON.parse(payload.post_parent),
      post_metas: JSON.parse(payload.post_metas),
      taxonomyIds: JSON.parse(payload.taxonomyIds),
      files: files,
    });
  }

  @Get(':id')
  async GetPost(@Param('id') id: number): Promise<PostModel> {
    return this.postService.getPost(id);
  }

  @Get('')
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('status') status: string,
    @Query('date') date?: string,
    @Query('featured') featured?: number,
    @Query('taxonomy_id') taxonomy_id?: number,
  ): Promise<AbstarctModel<Wp_posts>> {
    limit = limit > 100 ? 100 : limit;
    return this.postService.getAll(
      {
        page,
        limit,
        route: 'http://cats.com/cats',
      },
      status,
      date,
      featured,
      taxonomy_id,
    );
  }

  @Put('post-meta')
  async updatePostMetas(@Body() paylaod: Wp_postmeta): Promise<any> {
    return this.postMetaService.updatePostMeta(paylaod);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: number,
    @Body() paylaod: Wp_posts,
  ): Promise<Wp_posts> {
    console.log(paylaod);
    paylaod.ID = id;
    return this.postService.updatePost(paylaod);
  }
}
