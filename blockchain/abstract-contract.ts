import {
  Observable,
  catchError,
  mergeMap,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { BotConfiguration } from "../configuration/api/configuration.models";
import { CouldNotConnectToNodeError, FailedToCheckForTransactionReceiptError, InsufficientFundsError, NonBlockerError, TransactionRevertError } from "./api/errors/errors.model";
import {
  Web3Account,
  Web3SignedTransaction,
  Web3TransactionConfig,
} from "./api/models/account.model";
import { Web3TransactionReceipt } from "./api/models/web3.model";
import { Web3Wrapper } from "./api/web3-wrapper";
import Contract from "web3-eth-contract";
export abstract class AbstractContract {

  constructor(
    protected readonly botConfig: BotConfiguration,
    protected readonly web3Wrapper: Web3Wrapper,
    protected readonly address: string
  ) {
    Contract.setProvider(botConfig.getRpcUrl());
  }


  protected callWriteFunction(
    gasAmount$: Observable<number>,
    account: Web3Account,
    value: string,
    encodedData: string,
    waitForConfirmation: boolean = false
  ): Observable<Web3TransactionReceipt> {
    console.debug(
      `Entering callWriteFunction with value = ${value} and encodedData = ${encodedData}`
    );
    return gasAmount$.pipe(
      catchError((e) => {
        const msg = (e as Error)?.message;

        if (msg?.indexOf("insufficient funds for gas") > 0) {
          return throwError(
            () =>
              new InsufficientFundsError(
                `Encountering error while estimating gas: ${msg} `,
                { cause: e }
              )
          );
        }
        if ((e as Error)?.message?.indexOf("Couldn't connect to node") > 0) {
          return throwError(
            () =>
              new CouldNotConnectToNodeError(
                `Encountering error while estimating gas: ${msg} `,
                { cause: e }
              )
          );
        }
        const nonBlockerError = new NonBlockerError(
          `Error while estimating gas - : ${msg}
          } `,
          { cause: e }
        )
        nonBlockerError.displayedMessage = msg;
        return throwError(
          () =>
            nonBlockerError
        );
      }),
      tap((gasPrice) =>
        gasPrice > 0
          ? console.log(`Transaction will cost : ${this.web3Wrapper.fromWei(this.web3Wrapper.toWei((gasPrice * 3).toString(), 'gwei').toFixed())} ${this.botConfig.getUnit()}`)
          : {}
      ),
      mergeMap((gasPrice) => {
        let txParams: Web3TransactionConfig = {
          from: account.getAddress(),
          ...(gasPrice > 0 && {
            gas: this.web3Wrapper.toHex(gasPrice as number),
          }),
          chainId: +this.botConfig.getChainId(),
          value: this.web3Wrapper.toHex(value),
          to: this.address,
          data: encodedData,
        };
        console.debug(`Tx data is ${JSON.stringify(txParams)}`);
        return this.signTransaction(account, txParams);
      }),
      switchMap((signedTx: Web3SignedTransaction) => {
        if (!signedTx.rawTransaction) {
          console.debug(`Throwing undefined raw Transaction error`);
          return throwError(
            () =>
              new Error(
                "The signed TX has an undefined rawTransaction attribute"
              )
          );
        }
        console.debug(`Signed TX is ${JSON.stringify(signedTx)} `);
        return this.sendSignedTransaction(signedTx, waitForConfirmation);
      }),
      tap((o) =>
        console.log(`Transaction sent with hash : ${o.transactionHash} `)
      )
    );
  }

  private signTransaction(
    account: Web3Account,
    txParams: Web3TransactionConfig
  ): Observable<Web3SignedTransaction> {
    console.debug(`Entering signTransaction`);
    return account
      .signTransaction(txParams as Web3TransactionConfig)
      .pipe(
        catchError((e) =>
          throwError(
            () =>
              new Error(
                "Account.signTransaction failed: " + (e as Error).message,
                { cause: e }
              )
          )
        )
      );
  }

  private sendSignedTransaction(
    signedTx: Web3SignedTransaction,
    waitForConfirmation: boolean
  ): Observable<Web3TransactionReceipt> {
    console.debug(`Entering sendSignedTransaction`);
    return this.web3Wrapper
      .sendSignedTransaction(
        signedTx.rawTransaction as string,
        waitForConfirmation
      )
      .pipe(
        catchError((e) => {
          const msg = (e as Error)?.message;
          if (msg?.indexOf("insufficient funds for gas") > 0) {
            return throwError(
              () =>
                new InsufficientFundsError(
                  `Encountering error while signing raw x: ${msg}
                  } `,
                  { cause: e }
                )
            );
          } else if (msg?.indexOf("Failed to check for transaction receipt") > 0) {
            return throwError(
              () =>
                new FailedToCheckForTransactionReceiptError(
                  `Encountering error while signing raw x: ${msg}
                  } `,
                  { cause: e }
                )
            );
          } else if (msg.startsWith("Transaction has been reverted")) {
            return throwError(
              () =>
                new TransactionRevertError(
                  `Encountering error while signing raw x: ${msg}
                  } `,
                  { cause: e }
                )
            );
          } else if ((e as Error)?.message?.indexOf("Couldn't connect to node") > 0) {
            return throwError(
              () =>
                new CouldNotConnectToNodeError(
                  `Encountering error while estimating gas: ${msg}
                  } `,
                  { cause: e }
                )
            );
          }
          const nonBlockerError = new NonBlockerError(
            `Encountering error while signing raw x: ${msg}
            } `,
            { cause: e }
          )
          nonBlockerError.displayedMessage = msg;
          return throwError(
            () =>
              nonBlockerError
          );
        })
      );
  }
}
