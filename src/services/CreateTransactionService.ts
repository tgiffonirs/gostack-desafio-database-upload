import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Saldo insuficiente para realizar a movimentação');
    }

    let newCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!newCategory) {
      newCategory = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);
    }

    const transaction = await transactionsRepository.create({
      title,
      type,
      value,
      category_id: newCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
