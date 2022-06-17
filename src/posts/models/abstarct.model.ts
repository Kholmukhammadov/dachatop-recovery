import { IPaginationLinks, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { PostModel } from './post.model';

export class AbstarctModel<T> {
  items?: T[];
  data?: PostModel[];
  meta?: IPaginationMeta;
  links?: IPaginationLinks;
}
