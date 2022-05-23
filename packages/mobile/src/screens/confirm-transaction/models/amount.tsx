export interface IAmount {
  amount: number;
  amountString: string;
  currency: string;
  adding(amount2: IAmount): IAmount;
  subtracting(amount2: IAmount): IAmount;
  toString(): string;
}

export class Amount implements IAmount {
  amount: number;
  amountString: string;
  currency: string;

  constructor(amount: number, amountString: string, currency: string) {
    this.amount = amount;
    this.amountString = amountString;
    this.currency = currency;
  }

  static empty(): Amount {
    return new Amount(0, "0", "");
  }

  adding(amount2: IAmount): IAmount {
    const newAmount = this.amount + amount2.amount;
    return new Amount(
      newAmount,
      newAmount.toString(),
      this.currency,
    );
  }

  subtracting(amount2: IAmount): IAmount {
    const newAmount = this.amount - amount2.amount;
    return new Amount(
      newAmount,
      newAmount.toString(),
      this.currency,
    );
  }

  toString(): string {
    return `${this.amountString} ${this.currency}`;
  }
}
