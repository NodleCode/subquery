import { Balance } from '@polkadot/types/interfaces/runtime';
import { History } from "../types";

type FilterHistory<T, J> = {
    [K in keyof T]: T[K] extends J ? K : never;
}[keyof T];

export function baseEventHandler<K extends FilterHistory<History, number>>(
    dataStore: History,
    key: K
) {
    const history = dataStore;
    const total = history[key] || 0;

    history[key] = total + 1;

    logger.info(`Saved History: ${JSON.stringify(history, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        )}`);
}

export function baseEventHandlerForBN<K extends FilterHistory<History, bigint>>(
    dataStore: History,
    balance: Balance,
    key: K
) {
    const history = dataStore;
    const current = history[key];
    const amount = balance;
    history[key] = BigInt(current || 0) + amount.toBigInt();

    logger.info(`Saved History: ${JSON.stringify(history, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        )}`);
}

