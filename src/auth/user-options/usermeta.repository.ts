import { EntityRepository, Repository } from 'typeorm';
import { Wp_usermeta } from './wp_usermeta.entity';
import { Wp_Users } from '../user/wp_users.entity';
import * as PhpSerializer from 'php-serialize';

@EntityRepository(Wp_usermeta)
export class UsermetaRepository extends Repository<Wp_usermeta> {
  meta_key: string[] = [
    'nickname',
    'first_name',
    'last_name',
    'description',
    'rich_editing',
    'syntax_highlighting',
    'comment_shortcuts',
    'admin_color',
    'use_ssl',
    'show_admin_bar_front',
    'locale',
    'wp_capabilities',
    'wp_user_level',
    'dismissed_wp_pointers',
    'session_tokens',
    'is_email_verified',
  ];

  meta_value: string[] = [
    '',
    '',
    '',
    '',
    'true',
    'ture',
    'false',
    'fresh',
    '0',
    'true',
    '',
    '',
    '0',
    '',
    '',
    '0',
  ];
  async createUserMetas(
    user: Wp_Users,
    role: string,
    number: string,
  ): Promise<Wp_usermeta[]> {
    const userMetas: Wp_usermeta[] = [];
    await Promise.all(
      this.meta_key.map((meta_key, index) => {
        const userMeta1: Wp_usermeta = {};
        userMeta1.user_id = user.ID;
        userMeta1.meta_key = meta_key;
        if (meta_key === 'nickname') {
          userMeta1.meta_value = user.user_nicename;
        }
        if (meta_key === 'wp_capabilities') {
          if (typeof role === 'object') {
            userMeta1.meta_value = PhpSerializer.serialize(role);
          } else {
            userMeta1.meta_value = PhpSerializer.serialize(JSON.parse(role));
          }
        }
        if (!userMeta1.meta_value) {
          userMeta1.meta_value = this.meta_value[index];
        }
        userMetas.push(userMeta1);
      }),
    );
    userMetas.push({
      user_id: user.ID,
      meta_key: 'phoneNumber',
      meta_value: number,
    });
    return await this.save(userMetas);
  }
  async getUserMeta(user_id): Promise<string> {
    const userMeta: Wp_usermeta = await this.findOne({
      user_id: user_id,
      meta_key: 'wp_capabilities',
    });
    const role = Object.keys(PhpSerializer.unserialize(userMeta.meta_value))[0];
    return role;
  }

  async getUserPhone(user_id): Promise<Wp_usermeta> {
    return await this.findOne({
      user_id: user_id,
      meta_key: 'phoneNumber',
    });
  }
}
