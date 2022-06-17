import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wp_postmeta {
  @PrimaryGeneratedColumn()
  meta_id?: number;

  @Column()
  post_id?: number;

  @Column()
  meta_key: string;

  @Column()
  meta_value: string;
}
