import { Balance } from '@polkadot/types/interfaces/runtime';
import { SubstrateEvent } from "@subql/types";
import { checkHistoryData } from "./checkHistoryData";
import { History } from "../types";

type FilterHistory<T, J> = {
    [K in keyof T]: T[K] extends J ? K : never;
}[keyof T];

export async function baseEventHandler<K extends FilterHistory<History, number>>(
    event: SubstrateEvent,
    key: K
) {
    const date = new Date(event.extrinsic.block.timestamp);
    const history = await checkHistoryData(date);
    const total = history[key] || 0;

    history[key] = total + 1;

    await history.save().catch((e) => {
        logger.error(`Error saving history: ${e}`);
    });
}
