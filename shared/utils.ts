import { existsSync } from 'fs';
import { BackgroundColorEnum, ColorControlEnum, ColorEnum, LogLevel } from './shared.model';
import fs from 'fs';
export abstract class Utils {

    private static logsPath = '';

    static getMessageFromError(e: Error): string {
        if (e.message === 'Returned error: execution reverted: It is not time to buy') {
            return 'Presale did not start yet !';
        }
        return e.message;
    }

    public static throwIfFileNotExists(configFilePath: string) {
        if (!existsSync(configFilePath)) {
            throw new Error(`FILE_DONT_EXITS: ${configFilePath} does not exists, please place the config file in the same directory as the bot executable`);
        }

    }

    public static getEnumKeyByEnumValue<T extends { [index: string]: string }>(myEnum: T, enumValue: string): keyof T | null {
        let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
        return keys.length > 0 ? keys[0] : null;
    }

    public static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static writeLog(msg: string | undefined) {
        if (this.logsPath !== '') {
            fs.appendFile(Utils.logsPath, msg + '\r\n', function (err) {
                if (err) {
                    console.warn("Error writing logs : " + err)
                };
            });
        }
    }

    public static async initFileLogConfiguration(campaign: string) {
        console.debug(`initFileLogConfiguration: with campaign = ${campaign}`);

        let fileTime = new Date().toISOString().replaceAll(':', '-').replace('.', '-');
        const process = require('process');
        let logsDir = process.cwd() + '/logs/';
        Utils.logsPath = logsDir + campaign + '-token-retriever-bot-' + fileTime + '.log';
        console.debug(`initFileLogConfiguration: logPaths is ${Utils.logsPath}`);

        if (!fs.existsSync(logsDir)) {
            console.debug(`initFileLogConfiguration: Directory ${logsDir} doesnt exist, we create it`);
            await fs.mkdirSync(logsDir);
        }

        if (!fs.existsSync(Utils.logsPath)) {
            console.debug(`initFileLogConfiguration: File ${Utils.logsPath} doesn't exists, we create it.`);
            await fs.writeFile(Utils.logsPath, '', function (err) {
                if (err) throw err;
            });
        }
    }

    public static initLogger(loglLevel: LogLevel) {
        let logLevels = ["debug", "log", "warn", "error", "none"];
        let shouldLog = (level: LogLevel) => {
            // @ts-ignore
            return logLevels.indexOf(level) >= logLevels.indexOf(loglLevel);
        };

        // @ts-ignore
        global.logLevel = "debug";
        let _console = console


        global.console = {
            ...global.console,
            log: (message?: any, color?: ColorEnum | BackgroundColorEnum | ColorControlEnum, ...optionalParams: any[]) => {
                if (shouldLog(LogLevel.log)) {
                    if (!!color) {
                        _console.log(color, message + '\x1b[0m');
                    } else {
                        _console.log(message, ...optionalParams);
                    }

                }
                Utils.writeLog(message);
            },
            warn: (message?: any, ...optionalParams: any[]) => {
                const msg = 'WARN - ' + message;
                if (shouldLog(LogLevel.warn)) {
                    _console.warn(ColorEnum.YELLOW, msg + '\x1b[0m', ...optionalParams);
                }
                Utils.writeLog(msg);
            },
            error: (message?: any, ...optionalParams: any[]) => {
                const msg = 'ERROR - ' + message;
                if (shouldLog(LogLevel.error)) {

                    _console.error(ColorEnum.RED, msg + '\x1b[0m', ...optionalParams);
                }
                Utils.writeLog(msg);

            },
            debug: (message?: any, ...optionalParams: any[]) => {
                const msg = 'DEBUG - ' + message;
                if (shouldLog(LogLevel.debug)) {
                    _console.error(ColorEnum.RED, msg + '\x1b[0m', ...optionalParams);
                }
                Utils.writeLog(msg);
            },
        };
    }

    public static logIntro() {

        console.log("" +
            "\r\n\r\n" +
            "\t\t ________         __                                _______               __                __                                          \r\n" +
            "\t\t/        |       /  |                              /       \             /  |              /  |                                         \r\n" +
            "\t\t$$$$$$$$/______  $$ |   __   ______   _______      $$$$$$$  |  ______   _$$ |_     ______  $$/   ______   __     __  ______    ______   \r\n" +
            "\t\t   $$ | /      \\ $$ |  /  | /      \\ /       \\     $$ |__$$ | /      \\ / $$   |   /      \\ /  | /      \\ /  \   /  |/      \\  /      \  \r\n" +
            "\t\t   $$ |/$$$$$$  |$$ |_/$$/ /$$$$$$  |$$$$$$$  |    $$    $$< /$$$$$$  |$$$$$$/   /$$$$$$  |$$ |/$$$$$$  |$$  \ /$$//$$$$$$  |/$$$$$$  | \r\n" +
            "\t\t   $$ |$$ |  $$ |$$   $$<  $$    $$ |$$ |  $$ |    $$$$$$$  |$$    $$ |  $$ | __ $$ |  $$/ $$ |$$    $$ | $$  /$$/ $$    $$ |$$ |  $$/  \r\n" +
            "\t\t   $$ |$$ \\__$$ |$$$$$$  \\ $$$$$$$$/ $$ |  $$ |    $$ |  $$ |$$$$$$$$/   $$ |/  |$$ |      $$ |$$$$$$$$/   $$ $$/  $$$$$$$$/ $$ |       \r\n" +
            "\t\t   $$ |$$    $$/ $$ | $$  |$$       |$$ |  $$ |    $$ |  $$ |$$       |  $$  $$/ $$ |      $$ |$$       |   $$$/   $$       |$$ |       \r\n" +
            "\t\t   $$/  $$$$$$/  $$/   $$/  $$$$$$$/ $$/   $$/     $$/   $$/  $$$$$$$/    $$$$/  $$/       $$/  $$$$$$$/     $/     $$$$$$$/ $$/         \r\n\r\n" +
            "\t\t\t\t\t\t\t\ttelegram : @eclipse_dev\r\n\r\n");
    }

    public static printStackTrace(e: Error) {
        if ((e as Error).cause) {
            Utils.writeLog(((e as Error).cause as Error).stack);
        }
        Utils.writeLog((e as Error).stack);
    }
}