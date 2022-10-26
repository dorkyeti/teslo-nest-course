import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/JwtPayload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      const token = this.signToken({ id: user.id });

      return { user, token };
    } catch (error) {
      throw new BadRequestException(error.detail)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    });

    if (user == null) throw new NotFoundException();

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('Password do not match');

    delete user.password;

    const token = this.signToken({ id: user.id });

    return { user, token };
  }

  verify(token: string): JwtPayload | false {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return false;
    }
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  private signToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  checkAuthStatus(user: User) {
    const token = this.signToken({ id: user.id });

    return { token, user };
  }
}
