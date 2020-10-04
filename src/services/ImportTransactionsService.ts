import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private async loadCSV(filePath: string): Promise<Request[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: Request[] = [];

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      };

      transactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }

  async execute(fileName: string): Promise<Transaction[]> {
    const pathFile = path.join(uploadConfig.directory, fileName);

    const transactionsList = await this.loadCSV(pathFile);

    const createTransaction = new CreateTransactionService();
    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const item of transactionsList) {
      const transaction = await createTransaction.execute({
        title: item.title,
        value: item.value,
        type: item.type,
        category: item.category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
