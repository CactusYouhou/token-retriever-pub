

import prompts from 'prompts';
import { ParamsValidator } from '../configuration/api/params.validator';
import { firstValueFrom } from 'rxjs';

export class Prompt {

    isNative: boolean = false ;

    constructor(private readonly paramsValidator: ParamsValidator) { }

    async globalPrompt() {
        console.log("\r\n");
        const questions: prompts.PromptObject[] = [
            {
                type: 'text',
                name: 'tokenAddress',
                message: 'Type or paste the token address you want to retrieve from your wallets (type native if you want to transfer native token): ',
                validate: async (tokenAddress: string) => {
                    this.isNative = tokenAddress.trim().toLowerCase() === 'native'
                    if (this.isNative || await (firstValueFrom(this.paramsValidator.isValidContractAddress(tokenAddress)))) {
                        return true;
                    } else {
                        return 'Address is not a valid contract address !';
                    }
                }
            },
            {
                type: 'text',
                name: 'destinationPrivateKey',
                message: 'Type or paste the private key of the wallet where the funds will be collected : ',
                validate: (destinationPrivateKey: string) => {
                    return this.paramsValidator.isValidPrivateKey(destinationPrivateKey) ?
                        true : 'private key is not valid !';
                }
            },
            {
                type: () => this.isNative ?  null : 'text',
                name: 'amountGasToSendToWallets',
                message: 'Specify the amount of native token to send to the wallets to deal with gas costs (0 if not needed) ',
                validate: (amountGasToSendToWallets: string) => {
                    if(this.paramsValidator.isValidEtherAmount(amountGasToSendToWallets)){
                        return true ;
                    } else {
                        return `Please type a valid number (float or natural without the unit) isNative = ${this.isNative}`;
                    }
                }
            },
            {
                type: () => this.isNative ?  null : 'text',
                name: 'minimumBalanceOfTokensToTransfer',
                initial: '0.0001',
                message: 'Specify the amount of tokens that a wallet need to have to trigger a transfer (if less, the bot will skip the wallet)',
                validate: (minimumBalanceOfTokensToTransfer: string) => {
                    if (!this.paramsValidator.isValidEtherAmount(minimumBalanceOfTokensToTransfer)) {
                        return 'Please type a valid number (float or natural without the unit)';
                    } else {
                        return true;
                    }
                }
            },
        ];
        return await prompts(questions);
    }
}