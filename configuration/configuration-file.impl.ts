import * as dotenv from "dotenv";
import { LogLevel } from "../shared/shared.model";
import { Utils } from "../shared/utils";
import {  BotConfiguration } from "./api/configuration.models";
import {
  ChainId,
  TARGET_CHAIN_TO_CHAIN_ID,
  TARGET_CHAIN_TO_UNIT,
  TARGET_CHAIN_TO_URL,
  TARGET_CHAIN_TO_WETH,
  TargetChain,
} from "./api/constants";
import path = require("path");

export class FileConfigurationImpl implements BotConfiguration {
  private loaded: boolean = false;

  private targetChain: TargetChain = TargetChain.bsc_test;

  private chainId: ChainId = ChainId.local;

  private rpcUrl: string = "";

  private weth: string = "";

  private unit: string = "BNB";

  private decimals: number = 2;

  private displayStackTrace: boolean = false;

  private logLevel: LogLevel | undefined;



  getLogLevel(): LogLevel {
    this.checkIsLoaded();
    return this.logLevel as LogLevel;
  }


  getTargetChain(): TargetChain {
    this.checkIsLoaded();
    return this.targetChain;
  }

  getChainId(): string {
    this.checkIsLoaded();
    return this.chainId;
  }
  getRpcUrl(): string {
    this.checkIsLoaded();
    return this.rpcUrl;
  }

  getWETHAddress(): string {
    this.checkIsLoaded();
    return this.weth;
  }

  getUnit(): string {
    this.checkIsLoaded();
    return this.unit;
  }

  getDecimals(): number {
    this.checkIsLoaded();
    return this.decimals;
  }



  isDisplayStackTrace(): boolean {
    this.checkIsLoaded();
    return this.displayStackTrace;
  }

  public initConfiguration(configFilePath: string) {
    const erroMessages = [];
    if (!this.loaded) {
      const finalPath: string = `${process.cwd()}/${configFilePath}`;
      Utils.throwIfFileNotExists(finalPath);
      dotenv.config({ path: finalPath });
    }
    console.debug(`Loading config file ${configFilePath}`);

    const strLogLevel = Utils.getEnumKeyByEnumValue(
      LogLevel,
      process.env.LOG_LEVEL as string
    );
    if (strLogLevel !== null) {
      this.logLevel = LogLevel[strLogLevel];
    } else {
      this.logLevel = LogLevel.log;
    }

    try {
      if (!!process.env.DECIMALS) {
        this.decimals = this.loadNumber(process.env.DECIMALS);
        if (this.decimals === 0) {
          throw new Error("decimals must be > 0");
        } else {
          console.debug(`Setting decimals to ${this.decimals}`);

        }
      }
    } catch (e: unknown) {
      erroMessages.push(`\r\nCONFIG_FILE[DECIMALS]: ${(e as Error).message}`);
    }

    let targetChain = Utils.getEnumKeyByEnumValue(
      TargetChain,
      process.env.TARGET_CHAIN as string
    );
    if (targetChain !== null) {
      let t = TargetChain[targetChain];
      this.targetChain = t;
      this.chainId = TARGET_CHAIN_TO_CHAIN_ID[t];
      this.rpcUrl = process.env.OVERRIDE_RPC_URL ? process.env.OVERRIDE_RPC_URL  : TARGET_CHAIN_TO_URL[t];
      this.weth = TARGET_CHAIN_TO_WETH[t];
    } else {
      erroMessages.push(
        `\r\nCONFIG_FILE[TARGET_CHAIN]: unknown target chain ${process.env.TARGET_CHAIN}`
      );
    }

    this.displayStackTrace = "true" === process.env.DISPLAY_STACK_TRACE;
    this.unit = TARGET_CHAIN_TO_UNIT[this.targetChain];
    if (erroMessages.length > 0) {
      throw new Error(erroMessages.toString());
    }
    this.loaded = true;
  }

  /**
   * string representation of the configuration.
   * @returns object as string
   */
  public toString(): string {
    return `{\n
            chainId: ${this.chainId},\n
            rpcUrl: ${this.rpcUrl}\n
        }`;
  }
  private loadNumber(value: string | undefined): number {
    if (!value || isNaN(+value)) {
      throw new Error("Value is not a number");
    }
    return Number(value);
  }
  private checkIsLoaded(): void {
    if (!this.loaded) {
      console.error("Configuration not loaded");
      process.exit();
    }
  }
}
