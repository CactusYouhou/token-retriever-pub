import BigNumber from "bignumber.js";
import { Observable } from "rxjs";
import { Web3Account } from "./models/account.model";
import { Web3TransactionReceipt, Web3Unit } from "./models/web3.model";
import { BotConfiguration } from "../../configuration/api/configuration.models";

export interface Web3Wrapper {
  isAddress(address: string): boolean;

  getCode(address: string): Observable<string>;

  toWei(value: string | number | BigNumber, unit?: Web3Unit): BigNumber;

  fromWei(value: string, decimals?: number): BigNumber;

  fromBNWei(value: BigNumber): BigNumber;

  privateKeyToAccount(pkey: string): Web3Account;

  balanceOf(account: Web3Account): Observable<BigNumber>;

  toHex(data: string | number | BigNumber): string;

  zeroAddress(): string;

  sendSignedTransaction(
    rawTx: string,
    waitForConfirmation: boolean
  ): Observable<Web3TransactionReceipt>;

  sendFromTo(botConfig: BotConfiguration, srcAccount: Web3Account, destAddr: string, amountToSend: string, srcBalance: string): Observable<BigNumber>;

}
