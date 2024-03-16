import { LogLevel } from "../../shared/shared.model";
import { Wallet } from "../wallet";
import { TargetChain } from "./constants";

export interface BotConfiguration {

  initConfiguration(configFilePath: string): void;
  getTargetChain(): TargetChain;
  getChainId(): string;
  getRpcUrl(): string;
  getWETHAddress(): string;
  getUnit(): string;
  /** technical */
  getLogLevel(): LogLevel;
  isDisplayStackTrace(): boolean;
}

export interface WalletConfiguration {
  getWallets(): Wallet[];
  getWalletById(id: number): Wallet | undefined;
  logWallets(): void;
  buildWallet(privateKey: string): Wallet ;
}
 
