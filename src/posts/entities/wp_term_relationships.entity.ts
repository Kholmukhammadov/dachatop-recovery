import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Wp_term_relationships {
  @PrimaryColumn()
  object_id: number;

  @PrimaryColumn()
  term_taxonomy_id: number;

  @Column()
  term_order: number;
}
