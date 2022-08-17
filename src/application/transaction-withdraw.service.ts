import { Service } from 'typedi';
import { TransactionService } from '../domain/transaction.service';
import { PaymentType, Transaction } from '../entity/transaction';
import { OutOfBalanceError } from '../errors/out-of-balance.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { TransactionRepository } from '../repository/transaction.repository';
import { UserRepository } from '../repository/user.repository';

@Service()
export class TransactionWithdrawService {
  constructor(
    protected readonly transactionService: TransactionService,
    protected readonly transactionRepository: TransactionRepository,
    protected readonly userRepository: UserRepository,
  ) {}

  withdraw = async (value: number, userId: number): Promise<Transaction | null> => {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const totalBalance = await this.transactionService.getBalance(user);

    if (value > totalBalance) {
      throw new OutOfBalanceError();
    }

    const newWithdrawTrx = new Transaction();
    newWithdrawTrx.user = user;
    newWithdrawTrx.value = value;
    newWithdrawTrx.type = PaymentType.PAYMENT_WITHDRAW;

    return this.transactionRepository.save(newWithdrawTrx);
  };
}
