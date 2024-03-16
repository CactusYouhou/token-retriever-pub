import BigNumber from "bignumber.js";
import { Account, TransactionConfig, SignedTransaction, Sign, EncryptedKeystoreV3Json } from "web3-core";
import { Observable, from } from "rxjs";

export interface Web3TransactionConfig {
    from?: string | number;
    to?: string;
    value?: number | string | BigNumber;
    gas?: number | string;
    gasPrice?: number | string | BigNumber;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    data?: string;
    nonce?: number;
    chainId?: number;
    chain?: string;
    hardfork?: string;
}
export interface Web3SignedTransaction {
    messageHash?: string;
    r: string;
    s: string;
    v: string;
    rawTransaction?: string;
    transactionHash?: string;
}
export interface Web3Sign extends Web3SignedTransaction {
    message: string;
    signature: string;
}

export interface Web3EncryptedKeystoreV3Json {
    version: number;
    id: string;
    address: string;
    crypto: {
        ciphertext: string;
        cipherparams: { iv: string };
        cipher: string;
        kdf: string;
        kdfparams: {
            dklen: number;
            salt: string;
            n: number;
            r: number;
            p: number;
        };
        mac: string;
    };
}

export interface Web3Account {
    signTransaction(transactionConfig: Web3TransactionConfig, callback?: (signTransaction: Web3SignedTransaction) => void): Observable<Web3SignedTransaction>;
    sign(data: string): Web3Sign;
    encrypt(password: string): Web3EncryptedKeystoreV3Json;
    getAddress(): string;
    getPrivateKey(): string;
}

export class Web3AccountImpl implements Web3Account {


    constructor(private readonly account: Account) {}

    signTransaction(transactionConfig: Web3TransactionConfig, callback?: (signTransaction: Web3SignedTransaction) => void): Observable<Web3SignedTransaction> {
        return from(this.account.signTransaction(transactionConfig as TransactionConfig, callback));
    }
    sign(data: string): Web3Sign {
        return this.account.sign(data);
    }
    encrypt(password: string): Web3EncryptedKeystoreV3Json {
        return this.account.encrypt(password);
    }

    getAddress(): string {
        return this.account.address;
    }

    getPrivateKey(): string {
        return this.account.privateKey;
    }
}

