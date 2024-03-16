import BigNumber from "bignumber.js";
import { Observable, catchError, from, map, tap, throwError } from "rxjs";
import Contract from "web3-eth-contract";
import { ERC20_ABI } from "./abi/erc20.abi";
import { AbstractContract } from "./abstract-contract";
import { ERC20Contract } from "./api/erc20-contract";
import { Web3Account } from "./api/models/account.model";
import { Web3TransactionReceipt } from "./api/models/web3.model";
import { BotConfiguration } from "../configuration/api/configuration.models";
import { Web3Wrapper } from "./api/web3-wrapper";

export class ERC20ContractImpl
  extends AbstractContract
  implements ERC20Contract {

  private erc20Contract!: Contract;

  constructor(
    protected _botConfig: BotConfiguration,
    protected _web3Wrapper: Web3Wrapper,
    protected _address: string
  ) {
    super(_botConfig, _web3Wrapper, _address);
    console.debug("init ERC20 contract");
    this.erc20Contract = new Contract(ERC20_ABI, _address);
    console.debug("ERC20 contract's address : " + _address);
  }

  balanceOf(account: Web3Account): Observable<BigNumber> {
    console.debug(`Calling balanceOf`);
    return from(
      this.erc20Contract.methods.balanceOf(account.getAddress()).call()
    ).pipe(
      catchError((e) =>
        throwError(
          () =>
            new Error(
              `Error while calling balanceOf: ${(e as Error).message}`,
              { cause: e }
            )
        )
      ),
      tap((v) => console.debug(`balanceOf : ${JSON.stringify(v)}`)),
      map((value: any) => new BigNumber(value))
    );
  }

  allowance(
    spenderAddress: string,
    account: Web3Account
  ): Observable<BigNumber> {
    console.debug(
      `Calling allowance(${spenderAddress},${account.getAddress()})`
    );
    return from(
      this.erc20Contract.methods
        .allowance(account.getAddress(), spenderAddress)
        .call()
    ).pipe(
      catchError((e) =>
        throwError(
          () =>
            new Error(
              `Error while calling allowance: ${(e as Error).message}`,
              { cause: e }
            )
        )
      ),
      tap((v) => console.debug(`allowance : ${JSON.stringify(v)}`)),
      map((value: any) => new BigNumber(value))
    );
  }

  approve(
    account: Web3Account,
    spenderAddress: string,
    amountInWei: BigNumber
  ): Observable<Web3TransactionReceipt> {
    console.debug(
      `Calling approve with account = ${JSON.stringify(
        account
      )} and spenderAddress = ${spenderAddress} and amount = ${amountInWei}`
    );
    const estimatePromise = this.erc20Contract.methods
      .approve(spenderAddress, amountInWei)
      .estimateGas({
        from: account.getAddress(),
        value: this.web3Wrapper.toHex("0"),
      }) as Promise<number>;
    let gasAmountForApproving$: Observable<number> = from(estimatePromise);
    const txData = this.erc20Contract.methods.approve(
      spenderAddress,
      amountInWei
    );
    return this.callWriteFunction(
      gasAmountForApproving$,
      account,
      "0",
      txData.encodeABI()
    );
  }

  transfer(
    srcAccount: Web3Account,
    destinationAccount: Web3Account,
    amountInWei: BigNumber
  ): Observable<Web3TransactionReceipt> {

    const estimatePromise = this.erc20Contract.methods
      .transfer(destinationAccount.getAddress(), amountInWei)
      .estimateGas({
        from: srcAccount.getAddress(),
        value: this.web3Wrapper.toHex("0"),
      }) as Promise<number>;
    let gasAmountForApproving$: Observable<number> = from(estimatePromise);
    const txData = this.erc20Contract.methods.transfer(
      destinationAccount.getAddress(),
      amountInWei
    );
    return this.callWriteFunction(
      gasAmountForApproving$,
      srcAccount,
      "0",
      txData.encodeABI()
    );
  }

  getSymbol(): Observable<string> {
    console.debug(`Calling getSymbol`);
    return from(this.erc20Contract.methods.symbol().call()).pipe(
      catchError((e) =>
        throwError(
          () =>
            new Error(
              `Error while calling symbol: ${(e as Error).message}`,
              { cause: e }
            )
        )
      ),
      map((value: any) => value)
    );
  }
}
