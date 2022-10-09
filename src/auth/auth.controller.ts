import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {
  AuthCredentialsDtoSignIn,
  AuthCredentialsDtoSignUp,
} from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { Wp_Users } from './user/wp_users.entity';
import { ResponseDto } from './dto/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  async singUp(
    @Body() authCredentialsDto: AuthCredentialsDtoSignUp,
  ): Promise<Wp_Users> {
    const user = await this.authService.singUp(authCredentialsDto);
    user.user_pass = '';
    user.user_activation_key = '';
    return user;
  }

  @Post('/signin')
  async singIn(
    @Body() authCredentialsDto: AuthCredentialsDtoSignIn,
  ): Promise<ResponseDto> {
    return await this.authService.singIn(authCredentialsDto);
  }

  @Put(':id')
  async verify(
    @Param('id') id: number,
    @Query('code') code: string,
  ): Promise<boolean> {
    const is_verified = await this.authService.verifyCode(code, id);
    if (is_verified === 1) {
      return true;
    }
    return false;
  }
  @Get(':id')
  async getCode(@Param('id') id: number): Promise<string> {
    return await this.authService.sendMessageAgain(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<string> {
    return `User with ${id} ID will be deleted soon`;
  }
}
