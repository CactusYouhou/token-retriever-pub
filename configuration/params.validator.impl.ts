import { map, Observable, of } from "rxjs";
import { Web3Wrapper } from "../blockchain/api/web3-wrapper";
import { WalletConfiguration } from "./api/configuration.models";
import { ParamsValidator } from "./api/params.validator";

export class ParamsValidatorImpl implements ParamsValidator {

    private readonly web3Wrapper: Web3Wrapper;
    private readonly walletConfiguration: WalletConfiguration
    constructor(web3Wrapper: Web3Wrapper, walletConfiguration: WalletConfiguration) {
        this.web3Wrapper = web3Wrapper;
        this.walletConfiguration = walletConfiguration ;
    }
   

    public isValidContractAddress(address: string): Observable<boolean> {
        if (!address || !this.web3Wrapper.isAddress(address)) {
            return of(false);
        } else {
            return this.web3Wrapper.getCode(address).pipe(
                map(code => {
                    return !(code === '0x') && address.length === 42
                })
            )
        }

    }

    public isValidAddress(address: string) {
        return this.web3Wrapper.isAddress(address);
    }

    public isValidNumberOrFloat(n: string): boolean {
        let isValid = false;
        if (!!n) {
            isValid = !(isNaN(+n) && isNaN(parseFloat(n)))
        }
        return isValid;
    }

    public isValidEtherAmount(n: string): boolean {
        let isValid = this.isValidNumberOrFloat(n);
        try {
            console.debug(`isValidEtherAmount : ${n}`);
            let v = this.web3Wrapper.toWei(n);
            console.debug(`isValidEtherAmount - wei : ${v}`);
        } catch (e: unknown) {
            isValid = false;
        }
        return isValid;
    }

     isValidPrivateKey(privateKey: string): boolean {
        try {
            this.walletConfiguration.buildWallet(privateKey) ;
            return true ;
        } catch (e: unknown) {
            return false ;
        }
    }

}