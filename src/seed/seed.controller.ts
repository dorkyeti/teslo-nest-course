import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Get()
    // @Auth(ValidRoles.admin)
    async invoke() {
        // return 'hi';
        return this.seedService.execute() ? { message: 'Seed runned successfully' } : { message: 'Error' };
    }
}
