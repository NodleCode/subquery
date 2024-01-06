import { Balance } from '@polkadot/types/interfaces/runtime';
import { SubstrateEvent } from "@subql/types";
import { checkHistoryData } from "../helpers/checkHistoryData";
import { checkAccountData } from '../helpers/checkAccount';

const REWARD_ACCOUNTS = [
    '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi',
    '4jByf7kvkZ7hGYwGMYhjFYHoLec3zNZ3EKD86PARZDcfnnkD',
    '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7',
    '4hyBs59AiVKw4jZ851hmEVzpvxFATxwjvTDi67ziwb4vYDCX',
    '4j5pigNy7LAX1dSGZQ7Tc2oms9dzZSEtwQJukSgQ9gAsQ9Fx',
]

const TREASURY_ACCOUNT = [
    '4jbtsgNhpGB2vH7xTjpZVzZLy7W4sFyxjvD45x7X1m6BSiGx',
    '4jbtsgNhpGB2voF5dZzKQ2tphWLjV48HSkfQwmWqNn3qa4rv',
    '4jbtsgNhpGB2voKv8rRSJYTAohbnHE5oVZ4DejZBEQVT5o86',
    '4jbtsgNhpGB2NtbdLN3xkB2urHo5JboKkSAjcBM4s3SzQdUt',
    '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi'
]

export async function handleBalancesTransferEvent(event: SubstrateEvent) {
    if (!event.block?.timestamp) {
        return;
    }

    const [from, to, _] = event.event.data
    const isReward = REWARD_ACCOUNTS.includes(from.toString()) || REWARD_ACCOUNTS.includes(to.toString())
    const isTreasury = TREASURY_ACCOUNT.includes(to.toString()) || TREASURY_ACCOUNT.includes(from.toString())
    const date = new Date(event.block.timestamp);

    const account = await checkAccountData(from.toString(),date);

    const history = await checkHistoryData(date);
    const total = history.balanceTransfers || 0;

    history.balanceTransfers = total + 1;
    account.balanceTransfers = (account.balanceTransfers || 0) + 1;
    
    const current = history.amountTransferred || 0;
    const amount = event.event.data[2] as Balance;
    history.amountTransferred = BigInt(current || 0) + amount.toBigInt();
    account.amountTransferred = BigInt((account.amountTransferred || 0)) + amount.toBigInt();

    if (!isReward && !isTreasury) {
        account.userBalanceTransfers = (account.userBalanceTransfers || 0) + 1;
        account.amountTransferredByUser = BigInt((account.amountTransferredByUser || 0)) + amount.toBigInt();
        history.userBalanceTransfers = (history.userBalanceTransfers || 0) + 1;
        history.amountTransferredByUser = BigInt((history.amountTransferredByUser || 0)) + amount.toBigInt();
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
