export class NonBlockerError extends Error {
    walletExcluded = false;
    displayedMessage: string | undefined;
    rethrow = false;

}

export class InsufficientFundsError extends NonBlockerError {
    displayedMessage = 'balance is insufficient for cover gas, the current operation is cancelled for this wallet';
    walletExcluded = true;
}

export class CouldNotConnectToNodeError extends NonBlockerError {
    displayedMessage = 'Could not connect to the node.'
}

export class FailedToCheckForTransactionReceiptError extends NonBlockerError {
    displayedMessage = 'Failed to check for transaction receipt.';
    walletExcluded = false;
}

export class TransactionRevertError extends NonBlockerError {
    displayedMessage = 'Transaction reverted by the EVM';
    walletExcluded = false;
}