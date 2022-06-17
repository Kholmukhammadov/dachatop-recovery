import { Wp_posts } from '../entities/wp_posts.entity';
import { Wp_postmeta } from '../entities/wp_postmeta.entity';
import { Express } from 'express';

export class CreatePostDTO {
  post_parent: Wp_posts;
  post_metas: Wp_postmeta[];
  taxonomyIds: number[];
  files: Array<Express.Multer.File>;
}
