import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Categories';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    transactions.map(async transaction => {
      const categorysRepository = getRepository(Category);

      const category = await categorysRepository.findOne({
        where: { id: transaction.category_id },
      });

      const transactionIndex = transactions.indexOf(transaction);
      const { id, title, type, value, created_at, updated_at } = transactions[
        transactionIndex
      ];

      const vTransaction = {
        id,
        title,
        type,
        value,
        category,
        created_at,
        updated_at,
      };

      transactions[transactionIndex] = vTransaction;
    });

    return transactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find();

    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .map(transactionIncome => transactionIncome.value)
      .reduce((total, value) => total + value, 0);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(transactionOutcome => transactionOutcome.value)
      .reduce((total, value) => total + value, 0);

    const total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
