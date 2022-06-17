import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wp_terms {
  @PrimaryGeneratedColumn()
  term_id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  term_group: number;
}
