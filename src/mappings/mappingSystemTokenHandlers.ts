import { SubstrateEvent } from "@subql/types";
import { Balance } from '@polkadot/types/interfaces/runtime';
import { checkIfExtrinsicExecuteSuccess } from "../helpers";
import { ensureAccount } from "../helpers/verifyAccount";
import { SystemTokenTransfer } from "../types/models";

export async function systemTokenTransferEvent(event: SubstrateEvent): Promise<void> {
    const from = event.event.data[0];
    const to = event.event.data[1];
    if(!from || !to) {
        logger.debug('Some of the from or to address is null', JSON.stringify(event.toHuman()));
        return;
    }
    const amount = event.event.data[2];
    const txHash = event.extrinsic.extrinsic.hash.toString();
    const senderAccount = await ensureAccount(from.toString());
    const receiverAccount = await ensureAccount(to.toString());
    receiverAccount.balance += (amount as Balance).toBigInt();
    senderAccount.balance -= (amount as Balance).toBigInt();
    await receiverAccount.save();
    await senderAccount.save();
    let record = new SystemTokenTransfer(`${event.block.block.header.number.toNumber()}-${event.idx}`);
    record.blockNumber = event.block.block.header.number.toBigInt();
    record.fromId = from.toString();
    record.toId = to.toString();
    record.txHash = txHash;
    record.amount =  (amount as Balance).toBigInt();
    record.timestamp = new Date(event.extrinsic.block.timestamp).getTime();
    record.success = checkIfExtrinsicExecuteSuccess(event.extrinsic)

    await record.save();
}