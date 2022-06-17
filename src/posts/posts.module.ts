import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapService } from './services/map/map.service';
import { PostController } from './controllers/post/post.controller';
import { Homey_mapRepository } from './repositories/homey_map.repository';
import { PostService } from './services/post/post.service';
import { PostsRepository } from './repositories/posts.repository';
import { PostMetaRepository } from './repositories/postmeta.repository';
import { PostMetaService } from './services/post-meta/post-meta.service';
import { TermTaxonomyRepository } from './repositories/term_taxonomy.repository';
import { TermsRepository } from './repositories/terms.repository';
import { TermRelationshipsRepository } from './repositories/term_relationship.repository,ts';
import { TermsService } from './services/terms/terms.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Homey_mapRepository,
      PostsRepository,
      PostMetaRepository,
      TermTaxonomyRepository,
      TermsRepository,
      TermRelationshipsRepository,
    ]),
    AuthModule,
  ],
  providers: [MapService, PostService, PostMetaService, TermsService],
  controllers: [PostController],
})
export class PostsModule {}
