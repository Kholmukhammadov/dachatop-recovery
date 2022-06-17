import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['user_login', 'user_nicename'])
export class Wp_Users {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ unique: true })
  user_login: string;

  @Column()
  user_pass: string;

  @Column({ unique: true })
  user_nicename: string;

  @Column()
  user_email?: string;

  @Column()
  user_url?: string;

  @Column()
  user_registered?: string;

  @Column()
  user_activation_key?: string;

  @Column()
  user_status?: number;

  @Column()
  display_name?: string;

  is_sms_send?: boolean;
}
