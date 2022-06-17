import { Wp_postmeta } from '../entities/wp_postmeta.entity';

export class PostMetaDTO {
  post_id: number;
  post_metas: Wp_postmeta[];
}
