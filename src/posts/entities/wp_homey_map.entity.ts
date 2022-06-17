import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wp_homey_map {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column()
  listing_id: number;
}
