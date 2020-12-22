import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = new TransactionsRepository();
  const transactions = await transactionRepository.all();

  return response.json({ transactions });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const transactionRepository = new CreateTransactionService();
  const transaction = await transactionRepository.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionRepository = new DeleteTransactionService();
  await transactionRepository.execute({ id });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('archive'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();

    await importTransactionService.execute({
      archiveFile: request.file.filename,
    });

    return response.json({ ok: true });
  },
);

export default transactionsRouter;
