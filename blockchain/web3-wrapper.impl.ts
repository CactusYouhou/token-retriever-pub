import BigNumber from "bignumber.js";
import BN from "bn.js";
import { Observable, catchError, combineLatest, firstValueFrom, from, map, of, switchMap, throwError } from "rxjs";
import Web3 from "web3";
import { BotConfiguration } from "../configuration/api/configuration.models";
import { Web3Wrapper } from "./api/web3-wrapper";

import { Web3Account, Web3AccountImpl, Web3TransactionConfig } from "./api/models/account.model";
import { Web3TransactionReceipt, Web3Unit } from "./api/models/web3.model";
import { TransactionReceipt } from "web3-core";
import { ColorEnum } from "../shared/shared.model";
import { InsufficientFundsError } from "./api/errors/errors.model";

export class Web3WrapperImpl implements Web3Wrapper {
  private readonly ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  private readonly web3;

  constructor(config: BotConfiguration) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.getRpcUrl()));
  }
  sendFromTo(botConfig: BotConfiguration, srcAccount: Web3Account, destAddr: string, amountToSend: string, srcBalance: string): Observable<BigNumber> {
    const estimageGas = this.web3.eth.estimateGas({
      to: destAddr,
      from: srcAccount.getAddress(),
      value: amountToSend,
    });

    return combineLatest([from(estimageGas), from(this.web3.eth.getGasPrice())]).pipe(
      map(([gasAmount, gasPrice]) => {
        const requiredGasAmount = new BigNumber(gasAmount).multipliedBy(gasPrice);
        if (new BigNumber(srcBalance).isLessThan(requiredGasAmount)) {
          throwError(
            () =>
              new InsufficientFundsError(
                `sending ${botConfig.getUnit()} failed: balance is lesser than transaction cost`
              )
          )
        }
        console.log(`Estimated required gas for transaction is ${this.fromWei('' + requiredGasAmount)}`);
        let valuePlusGas = new BigNumber(amountToSend).plus(new BigNumber(requiredGasAmount));
        if (valuePlusGas.isGreaterThan(new BigNumber(srcBalance))) {
          console.log(`Substracting needed gas from the sent amount.`);
          console.log(`Gas  ${this.fromWei(`${requiredGasAmount}`).toFixed()} ${botConfig.getUnit()}`, ColorEnum.YELLOW);
          amountToSend = new BigNumber(amountToSend).minus(new BigNumber(requiredGasAmount)).toFixed(0);
          if (new BigNumber(amountToSend).isLessThan(0)) {
            throwError(
              () =>
                new InsufficientFundsError(
                  `sending ${botConfig.getUnit()} failed: balance is too low to cover value + gas `
                )
            )
          }
          console.log(`New sent amount after substraction of gas ${this.fromWei(amountToSend).toFixed()} ${botConfig.getUnit()}`, ColorEnum.YELLOW);

        }
        let txParams: Web3TransactionConfig = {
          from: srcAccount.getAddress(),
          gas: 21000,
          chainId: +botConfig.getChainId(),
          value: amountToSend,
          to: destAddr,
        };
        return txParams;
      }),
      switchMap(txParams => srcAccount.signTransaction(txParams as Web3TransactionConfig)),
      switchMap(signedTx => this.sendSignedTransaction(signedTx.rawTransaction as string, false)),
      catchError((e) =>
        throwError(
          () =>
            new Error(
              "Account.signTransaction failed: " + (e as Error).message,
              { cause: e }
            )
        )
      ),
      map(() => new BigNumber(amountToSend))
    );
  }

  sendSignedTransaction(
    rawTx: string,
    waitForConfirmation: boolean
  ): Observable<Web3TransactionReceipt> {
    if (waitForConfirmation) {
      return from(
        new Promise<TransactionReceipt>((resolve, reject) => {
          this.web3.eth
            .sendSignedTransaction(rawTx)
            .on(
              "confirmation",
              (confirmationNumber: number, receipt: TransactionReceipt) => {
                if (confirmationNumber === 5) {
                  resolve(receipt);
                }
              }
            )
            .on("error", (error) => {
              reject(error);
            });
        })
      );
    } else {
      return from(this.web3.eth.sendSignedTransaction(rawTx));
    }
  }

  currentNonce(account: Web3Account): Observable<number> {
    return from(this.web3.eth.getTransactionCount(account.getAddress()));
  }

  balanceOf(account: Web3Account): Observable<BigNumber> {
    return from(this.web3.eth.getBalance(account.getAddress())).pipe(
      switchMap((val) => of(new BigNumber(val)))
    );
  }

  privateKeyToAccount(pkey: string): Web3Account {
    return new Web3AccountImpl(
      this.web3.eth.accounts.privateKeyToAccount(pkey)
    );
  }

  toWei(value: string, unit?: Web3Unit): BigNumber {
    return !!unit
      ? new BigNumber(this.web3.utils.toWei(value, unit))
      : new BigNumber(this.web3.utils.toWei(value));
  }

  fromWei(value: string, decimals?: number): BigNumber {
    if (decimals) {
      return new BigNumber(this.web3.utils.fromWei(value)).decimalPlaces(decimals);
    } else {
      return new BigNumber(this.web3.utils.fromWei(value));
    }
  }

  fromGWei(value: string, decimals?: number): BigNumber {
    if (decimals) {
      return new BigNumber(this.web3.utils.fromWei(value, 'gwei')).decimalPlaces(decimals);
    } else {
      return new BigNumber(this.web3.utils.fromWei(value, 'gwei'));
    }
  }

  fromBNWei(value: BigNumber): BigNumber {
    return new BigNumber(this.web3.utils.fromWei(value.toFixed()));
  }
  getCode(address: string): Observable<string> {
    return from(this.web3.eth.getCode(address)).pipe(
      catchError((e: Error) => throwError(() => "0x"))
    );
  }

  isAddress(address: string): boolean {
    return this.web3.utils.isAddress(address);
  }
  toHex(data: string | number | BigNumber): string {
    let hexified: string | number | BN;
    if (data instanceof BigNumber) {
      hexified = this.web3.utils.toBN(data.toString());
    } else {
      hexified = data;
    }
    return this.web3.utils.toHex(hexified);
  }

  zeroAddress(): string {
    return this.ZERO_ADDRESS;
  }
}
