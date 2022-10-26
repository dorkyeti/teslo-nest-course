import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/JwtPayload.interface";

@Injectable()
export class JwtStragety extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate({ id }: JwtPayload): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user)
            throw new UnauthorizedException('Token is not valid');

        if (user.deletedAt)
            throw new UnauthorizedException('User does not exist')

        return user;
    }
}