import { Express } from 'express';

export class PostChildDTO {
  files: Array<Express.Multer.File>;
  post_parent: number;
  post_title?: string;
  author_id?: number;
}
