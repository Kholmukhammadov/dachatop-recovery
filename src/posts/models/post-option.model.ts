import { Wp_postmeta } from '../entities/wp_postmeta.entity';
import { Wp_term_taxonomy } from '../entities/wp_term_taxonomy.entity';
import { Wp_usermeta } from '../../auth/user-options/wp_usermeta.entity';

export class PostOptionModel {
  post_details?: Wp_postmeta[];
  post_state_options?: Wp_term_taxonomy[];
  post_author?: Wp_usermeta;
}
