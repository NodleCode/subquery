import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces/runtime";
import { BalanceTransfer } from "../types/models";

export async function handleBalancesTransferEvent(event: SubstrateEvent) {
    const from = event.event.data[0];
    const to = event.event.data[1];
    if(!from || !to) {
        logger.error('Some of the from or to address is null', JSON.stringify(event.toHuman()));
        return;
    }
    
    const amount = event.event.data[2];
    let record = new BalanceTransfer(`${event.block.block.header.number.toNumber()}-${event.idx}`, '', '');
    record.blockNumber = event.block.block.header.number.toBigInt();
    record.from = from.toString();
    record.to = to.toString();
    record.amount =  (amount as Balance).toBigInt();
    if (event.extrinsic) {
        record.txHash = event.extrinsic.extrinsic.hash.toString();
        record.timestamp = event.extrinsic.block.timestamp.getTime();
        record.success = true; // this event is emitted from a successful extrinsic
    }

    return record.save();
}
