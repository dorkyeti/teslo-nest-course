import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed.data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
    constructor(
        private readonly productsService: ProductsService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    async execute() {
        // await this.deleteProducts();
        await this.deleteTables();
        const firstUser = await this.insertUsers();

        await this.insertProducts(firstUser);

        return true;
    }

    deleteProducts() {
        return this.productsService.drop();
    }

    private async deleteTables() {
        await this.productsService.drop();

        const userQueryBuilder = this.usersRepository.createQueryBuilder();
        await userQueryBuilder
            .delete()
            .where({})
            .execute()
    }

    async insertUsers() {
        const seedUsers = initialData.users;
        const users: User[] = [];

        seedUsers.forEach(u => {
            u.password = bcrypt.hashSync(u.password, 10);
            users.push(this.usersRepository.create(u))
        });

        const dbUsers = await this.usersRepository.save(users);

        return dbUsers[0];
    }

    async insertProducts(user: User) {
        const { products } = initialData;
        const promises = [];

        products.forEach(product => {
            promises.push(
                this.productsService.create(product, user)
            );
        });

        await Promise.all(promises);
    }
}
