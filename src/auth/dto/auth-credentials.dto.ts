import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDtoSignUp {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  user_login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  user_pass: string;

  @IsNotEmpty()
  // @IsString()
  user_role: any;

  @IsNotEmpty()
  @IsString()
  user_number: string;
}

export class AuthCredentialsDtoSignIn {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  user_login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  user_pass: string;
}
