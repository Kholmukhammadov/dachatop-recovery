import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './user/users.repository';
import {
  AuthCredentialsDtoSignIn,
  AuthCredentialsDtoSignUp,
} from './dto/auth-credentials.dto';
import * as Hasher from 'wordpress-hash-node';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Wp_Users } from './user/wp_users.entity';
import { ResponseDto } from './dto/response.dto';
import { UsermetaRepository } from './user-options/usermeta.repository';
import { HttpService } from '@nestjs/axios';
import sha1 from 'sha1';
import { lastValueFrom, map } from 'rxjs';
import { response } from 'express';
import { Wp_usermeta } from './user-options/wp_usermeta.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private userMetaRepository: UsermetaRepository,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async singUp(
    authCredentialsDto: AuthCredentialsDtoSignUp,
  ): Promise<Wp_Users> {
    const number = await this.userMetaRepository.findOne({
      meta_value: authCredentialsDto.user_number,
      meta_key: 'phoneNumber',
    });
    if (number) {
      throw new ConflictException('User with this number already exist');
    }
    const user: Wp_Users = await this.usersRepository.createUser(
      authCredentialsDto,
    );
    let res;
    if (user) {
      await this.userMetaRepository.createUserMetas(
        user,
        authCredentialsDto.user_role,
        authCredentialsDto.user_number,
      );
      res = await this.sendVerificationCode(
        user,
        authCredentialsDto.user_number,
      );
    }
    user.is_sms_send = res.length > 0 ? true : false;
    return user;
  }
  async singIn(
    authCredentialsDto: AuthCredentialsDtoSignIn,
  ): Promise<ResponseDto> {
    const response: ResponseDto = {};
    const { user_login, user_pass } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ user_login });
    const userMeta = await this.userMetaRepository.findOne({
      user_id: user.ID,
      meta_key: 'is_email_verified',
    });
    if (userMeta && Number(userMeta.meta_value) !== 1) {
      throw new ConflictException('Account is not verified');
    }
    if (user && (await Hasher.CheckPassword(user_pass, user.user_pass))) {
      const payload: JwtPayload = { user_login };
      response.userName = user.display_name;
      response.expiresIn = 3600;
      response.user_id = user.ID;
      response.accessToken = await this.jwtService.sign(payload);
      response.user_role = await this.userMetaRepository.getUserMeta(user.ID);
      return response;
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
  async sendVerificationCode(user: Wp_Users, number: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sha1 = require('sha1');
    const date = new Date(user.user_registered.toString())
      .toISOString()
      .slice(0, 10);
    const responseData = await lastValueFrom(
      this.httpService
        .post(
          'http://tiq.levelup.uz/send-sms.php',
          {
            number: number,
            message: `${user.user_activation_key.slice(0, 6)}`,
            p_id: user.ID,
          },
          {
            headers: {
              Service: `np88eqptqoh1xydqrx85vmo2w76cz98n;${sha1(
                'h49ixmjjwhrm0wa3f18gsf4gnupmks781c783hgli63vufce9v5yqtnydn86noed025ya1kle07yui29skm7r901hrdy6ag7xogwh4y0zkbr7m306f1ayx51fu54fyt2' +
                  date,
              )};${date}`,
            },
          },
        )
        .pipe(
          map((response) => {
            return response.data;
          }),
        ),
    );
    return responseData;
  }

  async verifyCode(code: string, user_id: number): Promise<number> {
    const user: Wp_Users = await this.usersRepository.findOne(user_id);
    let is_verified = 0;
    if (user.user_activation_key.includes(code)) {
      is_verified = 1;
      let userMeta: Wp_usermeta = await this.userMetaRepository.findOne({
        user_id: user_id,
        meta_key: 'is_email_verified',
      });
      userMeta.meta_value = '1';
      userMeta = await this.userMetaRepository.save(userMeta);
    }
    return is_verified;
  }
  async sendMessageAgain(user_id: number): Promise<string> {
    let userMeta = await this.userMetaRepository.findOne({
      user_id: user_id,
      meta_key: 'is_email_verified',
    });
    if (userMeta && Number(userMeta.meta_value) === 1) {
      throw new ConflictException('Account already has been verified');
    }
    userMeta = await this.userMetaRepository.findOne({
      user_id: user_id,
      meta_key: 'phoneNumber',
    });
    const user = await this.usersRepository.findOne(user_id);
    return await this.sendVerificationCode(user, userMeta.meta_value);
  }

  async getUserPhone(user_id: number): Promise<Wp_usermeta> {
    return await this.userMetaRepository.getUserPhone(user_id);
  }
}
