import fs from "fs";

/**
 * Enum describing the severity of an error when logged by {@link LogMessage}. Can be info, warn, and err
 */
export enum ErrorLevel {
    info,
    warn,
    err,
}

/**
 * Logs an error or information message to console and appends the message to the log file.
 *
 * @remarks
 * This function will only log the stack trace for errors if the verbose flag is set. (Once we implement the verbose flag)
 *
 * @param content - The string or error to be printed.
 * @param level - Severity of the error as an {@link ErrorLevel}.
 *
 * @see {@link ErrorLevel}
 */
export function LogMessage(content: string | Error, level: ErrorLevel): void {
    // Format the message
    let message: string = formatMessage(content, level);

    // Write the message to stdout or stderr based on the error level
    if (level >= ErrorLevel.err) {
        console.error(message);
    } else {
        console.log(message);
    }

    // Write the message to the log file
    try {
        fs.appendFileSync("./.FairSECO/program.log", message);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Creates the log file on disk.
 */
export function createLogFile(): void {
    // Open the file
    const fd: number = fs.openSync("./.FairSECO/program.log", "w+");
    
    // Write to the log file
    try {
        fs.writeSync(fd, formatMessage("FairSECO Log initialized", ErrorLevel.info));
        fs.writeSync(fd, "\n------------------------------\n");
        fs.closeSync(fd);
    } catch {
        console.error(formatMessage("Failed to create log file", ErrorLevel.err));
    }
}

/**
 * Formats a message for logging.
 * @param content The message in the form of a string or Error.
 * @param level The {@link ErrorLevel | error level} of the message.
 * @returns The formatted message.
 */
export function formatMessage(content: string | Error, level: ErrorLevel): string {
    // Start the message with the current date
    let message: string = new Date().toLocaleString("en-US");

    // Add the error level to the message
    const levelNames = {
        [ErrorLevel.info]: "INFO",
        [ErrorLevel.warn]: "WARN",
        [ErrorLevel.err]: "ERR"
    };
    message += "- [" + levelNames[level] + "]: ";

    // Add the content of the message
    if (typeof content === "string") {
        message += content;
    } else {
        message += content.message;
        // TODO: Check for the verbose flag here and print stack trace if necessary.
    }

    return message;
}