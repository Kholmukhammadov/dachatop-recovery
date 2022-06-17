import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Wp_usermeta {
  @PrimaryGeneratedColumn()
  umeta_id?: number;

  @Column()
  user_id?: number;

  @Column()
  meta_key?: string;

  @Column()
  meta_value?: string;
}
