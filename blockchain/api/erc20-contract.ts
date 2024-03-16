import BigNumber from "bignumber.js";
import { Observable } from "rxjs";
import { Web3Account } from "./models/account.model";
import { Web3TransactionReceipt } from "./models/web3.model";

export interface ERC20Contract {
    balanceOf(account: Web3Account): Observable<BigNumber>;
    approve(account: Web3Account, spenderAddress: string, amountInWei: BigNumber): Observable<Web3TransactionReceipt>;
    allowance(spenderAddress: string, account: Web3Account): Observable<BigNumber>;
    transfer(srcAccount: Web3Account, destinationAccount: Web3Account, amountInWei: BigNumber): Observable<Web3TransactionReceipt>;
    getSymbol(): Observable<string>;
}