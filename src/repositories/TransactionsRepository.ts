import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const transactions = await this.find();

    const balanceTotal = transactions.reduce((previous, current) => {
      const previousBalance = previous;

      previousBalance[current.type] += current.value;

      if (current.type === 'income') previousBalance.total += current.value;
      else previousBalance.total -= current.value;

      return previousBalance;
    }, balance);

    return balanceTotal;
  }
}

export default TransactionsRepository;
