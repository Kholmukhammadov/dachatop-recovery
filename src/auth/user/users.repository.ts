import { EntityRepository, Repository } from 'typeorm';
import { Wp_Users } from './wp_users.entity';
import { AuthCredentialsDtoSignUp } from '../dto/auth-credentials.dto';
import * as Hasher from 'wordpress-hash-node';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(Wp_Users)
export class UsersRepository extends Repository<Wp_Users> {
  async createUser(
    authCredentialsDto: AuthCredentialsDtoSignUp,
  ): Promise<Wp_Users> {
    const user_login = authCredentialsDto.user_login;
    const user_nicename = authCredentialsDto.user_login.toLowerCase();
    const user_registered = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const user_status = 0;
    const user_email = authCredentialsDto.user_login + '@test.com';
    const display_name = user_nicename;
    const user_pass = Hasher.HashPassword(authCredentialsDto.user_pass);
    const user = this.create({
      user_login,
      user_pass,
      user_nicename,
      user_email,
      user_registered,
      user_status,
      display_name,
    });
    const already = await this.findOne({ user_login: user.user_login });
    if (already) {
      throw new ConflictException('Username or email already exists');
    }
    try {
      let resUser: Wp_Users = await this.save(user);
      resUser = await this.findOne(resUser.ID);
      resUser.user_activation_key =
        resUser.ID.toString() +
        new Date(user_registered.slice(0, 10)).getTime();
      return await this.save(resUser);
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException('Username or email already exists');
      } else {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }
}
