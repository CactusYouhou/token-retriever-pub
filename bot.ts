/**
 *
 * Entry point for the presale bot.
 *
 */

import BigNumber from "bignumber.js";
import { firstValueFrom } from "rxjs";
import { Web3Account } from "./blockchain/api/models/account.model";
import { Web3Wrapper } from "./blockchain/api/web3-wrapper";
import { ERC20ContractImpl } from "./blockchain/erc20-contract.impl";
import { Web3WrapperImpl } from "./blockchain/web3-wrapper.impl";
import {
  BotConfiguration,
  WalletConfiguration,
} from "./configuration/api/configuration.models";
import { FileConfigurationImpl } from "./configuration/configuration-file.impl";
import { ParamsValidatorImpl } from "./configuration/params.validator.impl";
import { WalletConfigurationImpl } from "./configuration/wallet-configuration.impl";
import { Prompt } from "./display/prompt";
import { BackgroundColorEnum, ColorEnum } from "./shared/shared.model";
import { Utils } from "./shared/utils";
import { BN_ZERO } from "./shared/constants";
//import robot = require("robotjs");

const entryArgs = process.argv.slice(2);

let PAUSED = false;
let QUIT_BOT = false;

let configFile = `token_retriever.config`;

if (entryArgs.length > 1 && entryArgs[0] === "--config_file") {
  if (entryArgs[1].trim().length > 0) {
    configFile = entryArgs[1].trim();
  } else {
    console.log("Please provide a valid config file");
    process.exit();
  }
}
Utils.initFileLogConfiguration('token_retriever');
Utils.logIntro();

// Initialize configuration
const botConfig: BotConfiguration = new FileConfigurationImpl();

let web3Wrapper: Web3Wrapper;
let walletConfiguration: WalletConfiguration;

function listenKeyPress(): void {
  const listener = process.stdin.on("keypress", function (ch, key) {
    if (key && key.ctrl && key.name === "p") {
      if (!PAUSED) {
        PAUSED = true;
        console.log(
          "Bot has been paused, press 'CTRL+p' to continue or 'CTRL+c' to exit (Bot Will finish current operation before pausing).",
          BackgroundColorEnum.RED
        );
      } else {
        PAUSED = false;
        console.log(
          "Pause ended, bot will continue its work, type CTRL+p to re pause",
          BackgroundColorEnum.RED
        );
      }
    } else if (key && key.ctrl && key.name === "c" && !QUIT_BOT) {
      console.log("\r\n## Bot is going to exit after Ctrl + C ##", ColorEnum.RED);
      QUIT_BOT = true;
      process.exit(0);
    }

  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

async function transferFromWallets(
  walletsConfig: WalletConfiguration,
  tokenAddress: string,
  destinationPrivateKey: string,
  amountGasToSendToWallets: string,
  minimumBalanceOfTokensToTransfer: string) {
  const destinationWallet = walletsConfig.buildWallet(destinationPrivateKey);
  const amountGasToSendToWalletsInWei = web3Wrapper.toWei(amountGasToSendToWallets ? amountGasToSendToWallets : 0);
  const minimumBalanceOfTokensToTransferInWei = web3Wrapper.toWei(minimumBalanceOfTokensToTransfer);
  let transferredTokens = BN_ZERO;
  let transferredGas = BN_ZERO;
  console.log(`\n --> Sending funds to wallet ${destinationWallet.account.getAddress()}]\n`, ColorEnum.GREEN)
  for (let i: number = 1; i <= walletsConfig.getWallets().length && !QUIT_BOT; i++) {
    const wallet = walletsConfig.getWalletById(i);
    if (!!wallet) {
      try {
        console.log(`\n--> Dealing with wallet ${i} [${wallet?.account.getAddress()}]`, ColorEnum.GREEN)
        console.log(`Checking ${botConfig.getUnit()} balances`);

        const bal = await firstValueFrom(
          web3Wrapper.balanceOf(wallet?.account as Web3Account)
        );

        const destinationAccountBalance = await firstValueFrom(
          web3Wrapper.balanceOf(destinationWallet?.account as Web3Account)
        );
        console.log(`${botConfig.getUnit()} balance of destination wallet is ${web3Wrapper.fromWei(destinationAccountBalance.toFixed())}`);
        console.log(`${botConfig.getUnit()} balance of current wallet is ${web3Wrapper.fromWei(bal.toFixed())}`);
        switch (tokenAddress) {
          case 'native':
            const balMinusGas = bal.minus(amountGasToSendToWallets);
            if (!bal.isGreaterThan(0)) {
              console.log(`Skipping wallet ${i}, amount of ${botConfig.getUnit()} is too low`, ColorEnum.YELLOW);
            } else if (!balMinusGas.isGreaterThanOrEqualTo(minimumBalanceOfTokensToTransferInWei)) {
              console.log(`Skipping wallet ${i}, amount of ${botConfig.getUnit()} is < to minimum balance of token to transfer`, ColorEnum.YELLOW);
            } else if (!destinationAccountBalance.isGreaterThanOrEqualTo(amountGasToSendToWallets)) {
              console.log(`Skipping wallet ${i}, amount of ${botConfig.getUnit()} is < to the amount of gas to send to wallets`, ColorEnum.YELLOW);
            } else {
              console.log(`Sending ${web3Wrapper.fromWei(bal.toFixed())} ${botConfig.getUnit()}`, ColorEnum.YELLOW);
              const amount = await firstValueFrom(web3Wrapper.sendFromTo(botConfig, wallet.account, destinationWallet?.account.getAddress(), bal.toFixed(), bal.toFixed()));
              transferredTokens = new BigNumber(transferredTokens).plus(amount);
            }
            break;
          default:
            const erc20Contract = new ERC20ContractImpl(
              botConfig,
              web3Wrapper,
              tokenAddress
            );
            const symbol = await (firstValueFrom(erc20Contract.getSymbol()));
            console.log(`Checking balance of ${symbol}`);
            const tokenBalance = await (firstValueFrom(erc20Contract.balanceOf(wallet.account)));
            console.log(`Token balance is ${web3Wrapper.fromWei(tokenBalance.toFixed())} ${symbol}`);
            if (tokenBalance.isGreaterThan(minimumBalanceOfTokensToTransferInWei)) {
              if (amountGasToSendToWalletsInWei.isGreaterThan(bal)) {
                console.log('-------Gas Transfer------', ColorEnum.GRAY);
                let sentValueStr = web3Wrapper.fromWei(amountGasToSendToWalletsInWei.toFixed());
                console.log(`${botConfig.getUnit()} Balance is lesser than minimum gas, we send it ${sentValueStr} ${botConfig.getUnit()}`, ColorEnum.YELLOW);
                const amount = await firstValueFrom(web3Wrapper.sendFromTo(botConfig, destinationWallet?.account, wallet.account.getAddress(), amountGasToSendToWalletsInWei.toFixed(), destinationAccountBalance.toFixed()));
                console.log(`${sentValueStr} ${botConfig.getUnit()} sent.`);
                transferredGas = transferredTokens.plus(amount);
                console.log('-------Gas Transfer OK------', ColorEnum.GRAY);

              }
              console.log(`Transferring all tokens from ${wallet.account.getAddress()} to ${destinationWallet.account.getAddress()}`);
              await (firstValueFrom(erc20Contract.transfer(wallet.account, destinationWallet.account, tokenBalance)));
              transferredTokens = transferredTokens.plus(tokenBalance);
              console.log(`All token from wallet ${i} has been transferred to ${destinationWallet.account.getAddress()}`);

            } else {
              console.log(`Skipping wallet ${i}, amount of token ${symbol} is too low`, ColorEnum.YELLOW);
            }

        }
      } catch (e: unknown) {
        console.log(
          `Error while transferring tokens: ${(e as Error).message}`,
          ColorEnum.RED
        );
        printStackTrace(e as Error);
      }
    }
    await checkPaused();
  }
  console.log("\n\n###  ---- Transfer Synthesis ----  ###", ColorEnum.CYAN);
  console.log(` -> Total ${tokenAddress === 'native' ? 'native ' : ''}tokens transferred : ${web3Wrapper.fromBNWei(transferredTokens)}`)
  transferredGas.isGreaterThan(0) ? console.log(` -> Total gas transferred : ${web3Wrapper.fromBNWei(transferredGas)}`) : {};

}

(async () => {
  try {
    process.stdin.removeAllListeners("keypress");
    console.debug("Loading configuration...");
    botConfig.initConfiguration(configFile);
    Utils.initLogger(botConfig.getLogLevel());
    web3Wrapper = new Web3WrapperImpl(botConfig);
    walletConfiguration = new WalletConfigurationImpl(
      web3Wrapper,
      configFile
    );

    console.debug("Configuration loaded");

    walletConfiguration.logWallets();

    let paramsValidator = new ParamsValidatorImpl(web3Wrapper, walletConfiguration);
    let prompts = new Prompt(paramsValidator);
    let exitLoop = false;

    while (1 && !exitLoop && !QUIT_BOT) {

      try {
        listenKeyPress();
        const choice = await prompts.globalPrompt();
        console.log("Beginning wallets transfer", ColorEnum.CYAN);
        await transferFromWallets(
          walletConfiguration, choice.tokenAddress.trim(),
          choice.destinationPrivateKey.trim(),
          choice.amountGasToSendToWallets ? choice.amountGasToSendToWallets : '0',
          choice.minimumBalanceOfTokensToTransfer ? choice.minimumBalanceOfTokensToTransfer : '0.00021'
        );

      } catch (e: unknown) {
        console.log(
          "** ERRORS ** \r\n" + Utils.getMessageFromError(e as Error)
        );
        printStackTrace(e as Error);
      }
    }
    process.exit();
  } catch (e: unknown) {
    console.log("** ERRORS ** \r\n" + Utils.getMessageFromError(e as Error));
    if (botConfig.isDisplayStackTrace()) {
      if ((e as Error).cause) {
        console.log(((e as Error).cause as Error).stack);
      }
      console.log((e as Error).stack);
    }
  }
})();


function printStackTrace(e: Error) {
  if ((e as Error).cause) {
    Utils.writeLog(((e as Error).cause as Error).stack);
  }
  Utils.writeLog((e as Error).stack);
}
async function checkPaused() {
  while (PAUSED) {
    await Utils.delay(5000);
  }
}

