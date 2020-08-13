import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const findProducts = await this.productsRepository.findAllById(
      products.map(({ id }) => ({ id })),
    );

    if (products.length !== findProducts.length) {
      throw new AppError('Some products not found');
    }

    const orderProducts = findProducts.map(storedProduct => {
      const quantityRequired =
        products.find(product => product.id === storedProduct.id)?.quantity ||
        0;

      if (quantityRequired >= storedProduct.quantity) {
        throw new AppError('Insuficient product quantity');
      }

      const quantityToUpdate = storedProduct.quantity - quantityRequired;

      return {
        ...storedProduct,
        quantityToUpdate,
        quantityRequired,
      };
    });

    const [order] = await Promise.all([
      this.ordersRepository.create({
        customer,
        products: orderProducts.map(product => ({
          product_id: product.id,
          quantity: product.quantityRequired,
          price: product.price,
        })),
      }),
      this.productsRepository.updateQuantity(
        orderProducts.map(product => ({
          id: product.id,
          quantity: product.quantityToUpdate,
        })),
      ),
    ]);

    return order;
  }
}

export default CreateOrderService;
