import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { AccountId, Balance, BlockNumber } from '@polkadot/types/interfaces/runtime';
import type { Compact } from '@polkadot/types';
import { SystemTokenTransfer } from "../types/models/SystemTokenTransfer";
import { checkIfExtrinsicExecuteSuccess } from "../helpers";

export async function systemTokenTransferEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [from_origin, to_origin, amount_origin] } } = event;
    const from = (from_origin as AccountId).toString();
    const to = (to_origin as AccountId).toString();
    const amount = (amount_origin as Balance).toBigInt();
    const txHash = event.extrinsic.extrinsic.hash.toString();

    const blockNumber = (event.extrinsic.block.block.header.number as Compact<BlockNumber>).toNumber();

    let record = new SystemTokenTransfer(blockNumber.toString() + '-' + event.idx.toString());
    record.from = from;
    record.to = to;
    record.txHash = txHash;
    record.amount = amount;
    record.timestamp = event.block.timestamp;
    record.success = checkIfExtrinsicExecuteSuccess(event.extrinsic)

    await record.save();
}

export async function systemTokenTransferCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    const blockNumber = (extrinsic.block.block.header.number as Compact<BlockNumber>).toNumber();
    let record = new SystemTokenTransfer(blockNumber.toString() + '-' + extrinsic.idx.toString());
    record.from = extrinsic?.extrinsic?.signer?.toString();
    record.to = extrinsic.extrinsic.args[0].toString();
    record.txHash = extrinsic.extrinsic.hash.toString();
    record.amount = (extrinsic.extrinsic.args[1] as Balance).toBigInt();
    record.timestamp = extrinsic.block.timestamp;
    record.success = checkIfExtrinsicExecuteSuccess(extrinsic);

    await record.save();

}