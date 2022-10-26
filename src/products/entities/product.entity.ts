import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './';

@Entity({
  name: 'products'
})
export class Product {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Id identificativo del producto',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Lorem ipsum',
    description: 'Product title',
    uniqueItems: true
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Price of the product',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'When an unknown printer took a galley of type and scrambled it to make a type specimen book',
    description: 'Description of the product',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    example: 'lorem_ipsum',
    description: 'Slug of the title, SEO-related',
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 0,
    description: 'How many of this product the system has',
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['XL', 'L', 'XXL'],
    examples: [
      ['S', 'M', 'L'],
      ['M'],
      ['XL', 'L', 'XXL'],
    ],
    description: 'Available sizes of the product in the system',
    isArray: true,
  })
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    examples: ['men', 'women', 'kid', 'unisex'],
    description: 'For whom this product is',
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: ['shirt', 'clothes'],
    description: 'Related tags',
    isArray: true
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: ['image.png', 'imagen2.png'],
    description: 'Images related to the product for exhibition',
    isArray: true
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @ManyToOne(() => User, user => user.products, { eager: true })
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  insertSlug() {
    if (!this.slug || this.title != this.tempTitle) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .toLowerCase();
  }

  @Exclude({ toPlainOnly: true, toClassOnly: true })
  private tempTitle?: string;

  @AfterLoad()
  private loadTempTitle() {
    this.tempTitle = this.title;
  }
}
