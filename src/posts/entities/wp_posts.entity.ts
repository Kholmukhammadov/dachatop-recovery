import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Wp_postmeta } from './wp_postmeta.entity';

@Entity()
export class Wp_posts {
  @PrimaryGeneratedColumn()
  ID?: number;

  @Column()
  post_author?: number;

  @Column()
  post_date?: string;

  @Column()
  post_date_gmt?: string;

  @Column()
  post_content?: string;

  @Column()
  post_title?: string;

  @Column()
  post_excerpt?: string;

  @Column()
  post_status?: string;

  @Column()
  comment_status?: string;

  @Column()
  ping_status?: string;

  @Column()
  post_password?: string;

  @Column()
  post_name?: string;

  @Column()
  to_ping?: string;

  @Column()
  pinged?: string;

  @Column()
  post_modified?: string;

  @Column()
  post_modified_gmt?: string;

  @Column()
  post_content_filtered?: string;

  @Column()
  post_parent?: number;

  @Column()
  guid?: string;

  @Column()
  menu_order?: number;

  @Column()
  post_type?: string;

  @Column()
  post_mime_type?: string;

  @Column()
  comment_count?: number;

  post_metas?: Wp_postmeta[];
}
