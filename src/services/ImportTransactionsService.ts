import fs from 'fs';
import csv from 'csv-parse';
import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

interface Request {
  archiveFile: string;
}

class ImportTransactionsService {
  async execute({ archiveFile }: Request): Promise<Transaction[]> {
    const transactions = [];

    const parse = csv({ columns: true }, (err, object) => {
      object.map(async transaction => {
        const { title, value, type, category } = transaction;
        const transactionRepository = new CreateTransactionService();
        const nTransaction = await transactionRepository.execute({
          title,
          value,
          type,
          category,
        });
        transactions.push(nTransaction);
      });
    });
    fs.createReadStream(`${uploadConfig.directory}\\${archiveFile}`).pipe(
      parse,
    );

    console.log(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
