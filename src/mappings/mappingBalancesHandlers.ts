import { SubstrateEvent } from '@subql/types'
import { Balance } from '@polkadot/types/interfaces/runtime'
import { BalanceTransfer } from '../types/models'

const accountsFromRewards = [
    '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi',
    '4jByf7kvkZ7hGYwGMYhjFYHoLec3zNZ3EKD86PARZDcfnnkD',
    '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7',
    '4hyBs59AiVKw4jZ851hmEVzpvxFATxwjvTDi67ziwb4vYDCX',
    '4j5pigNy7LAX1dSGZQ7Tc2oms9dzZSEtwQJukSgQ9gAsQ9Fx',
]

export async function handleBalancesTransferEvent(event: SubstrateEvent) {
    const from = event.event.data[0]
    const to = event.event.data[1]
    if (!from || !to) {
        logger.error(
            'Some of the from or to address is null',
            JSON.stringify(event.toHuman())
        )
        return
    }

    const amount = event.event.data[2]
    let record = new BalanceTransfer(
        `${event.block.block.header.number.toNumber()}-${event.idx}`,
        '',
        ''
    )
    record.blockNumber = event.block.block.header.number.toBigInt()
    record.from = from.toString()
    record.to = to.toString()
    record.amount = (amount as Balance).toBigInt()
    record.isReward = accountsFromRewards.includes(from.toString())
    if (event.extrinsic) {
        record.txHash = event.extrinsic.extrinsic.hash.toString()
        record.timestamp = event.extrinsic.block.timestamp.getTime()
        record.success = true // this event is emitted from a successful extrinsic
    }

    return record.save()
}
