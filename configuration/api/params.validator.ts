import { Observable } from "rxjs";

export interface ParamsValidator {
    isValidEtherAmount(globalBuyAmount: string): boolean;
    isValidAddress(presaleAddress: string): boolean;
    isValidContractAddress(address: string): Observable<boolean>;
    isValidPrivateKey(privateKey: string) : boolean ;
}