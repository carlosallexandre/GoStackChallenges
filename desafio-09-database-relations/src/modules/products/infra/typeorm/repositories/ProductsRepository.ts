import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({ where: { name } });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.findByIds(
      products.map(({ id }) => id),
    );

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const findProducts = await this.findAllById(
      products.map(({ id }) => ({ id })),
    );

    const productsToUpdate = findProducts.map(storadeProdcut => {
      const quantityToUpdate =
        products.find(product => product.id === storadeProdcut.id)?.quantity ||
        0;

      return {
        ...storadeProdcut,
        quantity: quantityToUpdate,
      };
    });

    const updatedProducts = await this.ormRepository.save(productsToUpdate);

    return updatedProducts;
  }
}

export default ProductsRepository;
