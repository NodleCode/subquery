import { Balance } from '@polkadot/types/interfaces/runtime';
import { SubstrateEvent } from "@subql/types";
import { checkHistoryData } from "../helpers/checkHistoryData";

export async function handleBalancesTransferEvent(event: SubstrateEvent) {
    const date = new Date(event.block.timestamp);
    const history = await checkHistoryData(date);
    const total = history.balanceTransfers || 0;

    history.balanceTransfers = total + 1;

    const current = history.amountTranferred || 0;
    const amount = event.event.data[2] as Balance;
    history.amountTranferred = BigInt(current || 0) + amount.toBigInt();

    await history.save().catch((e) => {
        logger.error(`Error saving history: ${e}`);
    });
}
