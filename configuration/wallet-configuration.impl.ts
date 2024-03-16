import * as dotenv from "dotenv";
import { Web3Account } from "../blockchain/api/models/account.model";
import { Web3Wrapper } from "../blockchain/api/web3-wrapper";
import { WalletConfiguration } from "./api/configuration.models";
import { Utils } from '../shared/utils';
import { Wallet } from "./wallet";
import path = require('path');
import { ColorEnum } from "../shared/shared.model";

export class WalletConfigurationImpl implements WalletConfiguration {

    public wallets: Map<number, Wallet>;

    public constructor(private readonly web3Wrapper: Web3Wrapper, configFilePath: string) {
        this.wallets = new Map<number, Wallet>();

        if (path.resolve(configFilePath) === configFilePath || path.resolve(configFilePath) === path.normalize(configFilePath)) {
            Utils.throwIfFileNotExists(configFilePath);
            dotenv.config({ path: configFilePath });
        } else {
            const process = require('process');
            const finalPath: string = `${process.cwd()}/${configFilePath}`;
            Utils.throwIfFileNotExists(finalPath);
            dotenv.config({ path: finalPath });
        }
        try {
            this.loadWallets();
        } catch (e: unknown) {
            throw e;
        }
    }

    getWallets(): Wallet[] {
        return Array.from(this.wallets.values());
    }

    getWalletById(id: number): Wallet | undefined {
        return this.wallets.get(id);
    }

    logWallets(): void {
        console.log("## Loaded wallets from configuration ##");
        this.wallets.forEach((w) => {
            console.log(` -> Wallet ${w.id} : [${w.account.getAddress()}]`, ColorEnum.GREEN
            )
        })
    }
    private loadWallets() {

        for (const val in process.env) {
            const cleanedVal = val.trim().toLowerCase();
            if (cleanedVal.trim().toLowerCase().startsWith('wallet.')) {
                const w = /^wallet\.(\d+)$/.exec(cleanedVal);
                if (w !== null) {
                    const id: number = +w[1];
                    try {
                        let pKey = (process.env[cleanedVal] as string).trim();
                        pKey = pKey.startsWith('0x') ? pKey.slice(2) : pKey;
                        const account: Web3Account = this.web3Wrapper.privateKeyToAccount(pKey);
                        const wallet: Wallet = new Wallet(id, account);
                        this.wallets.set(id, wallet);
                    } catch (e: unknown) {
                        throw new Error(`WALLET_MISCONFIG[PKEY]: ${cleanedVal} do not define a valid private key`)
                    }
                } else {
                    throw new Error(`WALLET_MISCONFIG[PATTERN]: ${cleanedVal} do not respect wallet.x=private_key pattern`)
                }
            }
        }
        if (this.wallets.size === 0) {
            throw new Error('WALLET_MISCONFIG[NO_WALLETS]: No wallets defined in config file');
        } else {
            let walletNumberHole = false;
            let detectedHole = 0;
            let previouskey: number = 0;
            let sortedKeys = [...this.wallets.keys()].sort((a, b) => {
                if (Number(a) === Number(b)) {
                    return 0;
                } else if (Number(a) < Number(b)) {
                    return -1;
                } else {
                    return 1
                }
            });
            for (let i = 0; i < sortedKeys.length; i++) {
                if (+sortedKeys[i] !== ++previouskey) {
                    walletNumberHole = true;
                    detectedHole = sortedKeys[i] - 1;
                    break;
                }
            }
            if (walletNumberHole) {
                throw new Error('WALLET_MISCONFIG[HOLE_IN_WALLETS]: There is number holes in wallet configuration(missing wallet.' + detectedHole + ')')
            }
            this.wallets = new Map<number, Wallet>([...this.wallets.entries()].sort((a, b) => {
                if (a[0] === b[0]) {
                    return 0;
                } else if (a[0] < b[0]) {
                    return -1;
                } else {
                    return 1
                }
            }));
        }
    }

    buildWallet(privateKey: string): Wallet {
        let pKey = privateKey.trim();
        pKey = pKey.startsWith('0x') ? pKey.slice(2) : pKey;
        const account: Web3Account = this.web3Wrapper.privateKeyToAccount(pKey);
        const wallet: Wallet = new Wallet(0, account);
        return wallet;
    }

    getAllPkeys(): string[] {
        return Array.from(this.wallets.values()).map(wallet => wallet.account.getPrivateKey());
    }



}