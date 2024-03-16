import BigNumber from 'bignumber.js';
import { Web3Account } from '../blockchain/api/models/account.model';
import { BN_ZERO } from '../shared/constants';

export class Wallet {


    readonly id: number;
    readonly account: Web3Account;
    balance: BigNumber;

    constructor(id: number, _account: Web3Account) {
        this.id = id;
        this.account = _account;
        this.balance = BN_ZERO;
    }


}