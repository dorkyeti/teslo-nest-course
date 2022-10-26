import { Controller, Post, Body, HttpCode, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { RawHeaders } from 'src/common/decorators/raw-headers.decorator';
import { AuthService } from './auth.service';
import { Auth } from './decorators';
import { GetUser } from './decorators/get-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { ValidRoles } from './emuns/valid-roles.enums';
import { User } from './entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return {
      ok: true,
      message: 'hola',
      user,
      email,
      rawHeaders
    }
  }

  @Get('private2')
  @Roles()
  private2Route(
    @GetUser() user: User
  ) {
    return { user };
  }

  @Get('private3')
  @Auth(ValidRoles.user)
  private3Route(@GetUser() user: User) {
    return { user }
  }
}
