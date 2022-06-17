import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Wp_terms } from './wp_terms.entity';

@Entity()
export class Wp_term_taxonomy {
  @PrimaryGeneratedColumn()
  term_taxonomy_id: number;

  @Column()
  term_id: number;

  @Column()
  taxonomy: string;

  @Column()
  description: string;

  @Column()
  parent: number;

  @Column()
  count: number;

  term?: Wp_terms;
}
