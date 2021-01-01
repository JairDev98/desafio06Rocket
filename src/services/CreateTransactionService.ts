// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Categories';

import AppError from '../errors/AppError';

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
    const transactionRepo = new TransactionsRepository();

    const { total } = await transactionRepo.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('insufficient total for outcome to be realized', 400);
    }

    // VERIFICAÇÃO DA CATEGORY ( SE UMA CATERORIA COM ESSE NOME JÁ EXISTE NO TABELA CATEROY NA BASE DE DADOS )
    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    // SE NÃO EXISTIR EU FAÇO O CADASTRO DESTA CATEGORY E LOGO APÓS PEGO O NÚMERO DO SEU ID
    if (!categoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);
    }

    const categoryID = await categoryRepository.findOne({
      where: { title: category },
    });

    // VAI SER EFETUADO O RETORNO DA TRANSACTION PARA O USUÁRIO, TANTO CATEGORY COMO TRANSACTION SEM AS IDS
    const transactionRepository = getRepository(Transaction);

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: categoryID,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
