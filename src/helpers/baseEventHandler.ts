import { SubstrateEvent } from "@subql/types";
import { checkHistoryData } from "./checkHistoryData";
import { Account, History } from "../types";
import { checkAccountData } from './checkAccount';

type FilterHistory<T, J> = {
    [K in keyof T]: T[K] extends J ? K : never;
}[keyof T];

export async function baseEventHandler<K extends FilterHistory<History, number>>(
    event: SubstrateEvent,
    key: K,
    acc: string
) {
    if (!event.block?.timestamp) {
        return;
    }

    const date = new Date(event.block.timestamp);
    const history = await checkHistoryData(date);
    const account = await checkAccountData(acc);
    const total = history[key] || 0;

    history[key] = total + 1;
    if (key in account) {
        const key2 = key as FilterHistory<Account, number>;
        account[key2] = (account[key2] || 0) + 1;
    }

    if (key === 'killedAccounts') {
        account.isAlive = false;
    }

    return Promise.all([
        history.save().catch((e) => {
            logger.error(`Error saving history: ${e}`);
        }),
        account.save().catch((e) => {
            logger.error(`Error saving account: ${e}`);
        })
    ]);
}
