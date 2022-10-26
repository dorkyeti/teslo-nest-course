import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto, UpdateProductDto } from './dto';

import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { env } from 'process';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) { }

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productDetails } = createProductDto;

    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((url) =>
          this.productImageRepository.create({ url }),
        ),
        user
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      throw new InternalServerErrorException(error.detail);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return products.map(this.processWithImage);
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });
    } else {
      const query = this.productRepository.createQueryBuilder('prod');
      product = await query
        .where('LOWER(title) = :term or slug = :term', {
          term: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (product == null) throw new NotFoundException();

    return product;
  }

  async findOnePlain(term: string) {
    const product = await this.findOne(term);

    return this.processWithImage(product);
  }

  private processWithImage(product: Product) {
    const { images = [], ...rest } = product;

    return {
      ...rest,
      images: images.map(img => img.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw NotFoundException;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        const imagesdb = await queryRunner.manager.find(ProductImage, {
          where: {
            product: {
              id
            }
          }
        });

        await queryRunner.manager.remove(ProductImage, imagesdb);

        product.images = images.map(url => this.productImageRepository.create({ url }))
      } else {
        // 
      }
      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      return product;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // throw new InternalServerErrorException(err.detail);
      throw err
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    return await this.productRepository.remove(product);
  }

  async drop() {
    if (env.ENVIROMENT == 'prod')
      throw new InternalServerErrorException('Acción no permitida');

    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(error.detail)
    }
  }
}
