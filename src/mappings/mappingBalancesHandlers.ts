import { SubstrateEvent } from '@subql/types'
import { Balance } from '@polkadot/types/interfaces/runtime'
import { AllBalanceTransfer, BalanceTransfer, Rewards, TransferToTreasury } from '../types/models'

const REWARD_ACCOUNTS = [
    '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi',
    '4jByf7kvkZ7hGYwGMYhjFYHoLec3zNZ3EKD86PARZDcfnnkD',
    '1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7',
    '4hyBs59AiVKw4jZ851hmEVzpvxFATxwjvTDi67ziwb4vYDCX',
    '4j5pigNy7LAX1dSGZQ7Tc2oms9dzZSEtwQJukSgQ9gAsQ9Fx',
]

const ALLOCATION_ACCOUNT = '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi'
const TREASURY_ACCOUNT = [
    '4jbtsgNhpGB2vH7xTjpZVzZLy7W4sFyxjvD45x7X1m6BSiGx',
    '4jbtsgNhpGB2voF5dZzKQ2tphWLjV48HSkfQwmWqNn3qa4rv',
    '4jbtsgNhpGB2voKv8rRSJYTAohbnHE5oVZ4DejZBEQVT5o86',
    '4jbtsgNhpGB2NtbdLN3xkB2urHo5JboKkSAjcBM4s3SzQdUt',
    '4jbtsgNhpGAzdEGrKRb7g8Mq4ToNUpBVxeye942tWfG3gcYi'
]

const getEntityByTxType = (event: SubstrateEvent) => {
    const [from, to, _] = event.event.data
    const isReward = REWARD_ACCOUNTS.includes(from.toString())
    const isTreasury = TREASURY_ACCOUNT.includes(to.toString())
    const result = []

    if (isReward) {
        result.push(new Rewards(
            `${event.block.block.header.number.toNumber()}-${event.idx}`,
            '',
            ''
        ))
    }

    if (isTreasury) {
        const entity = new TransferToTreasury(
            `${event.block.block.header.number.toNumber()}-${event.idx}`,
            '',
            ''
        )

        entity.isAllocation = from.toString() === ALLOCATION_ACCOUNT

        result.push(entity)
    }

    if (!isReward && !isTreasury) {
        result.push(new BalanceTransfer(
            `${event.block.block.header.number.toNumber()}-${event.idx}`,
            '',
            ''
        ))
    }

    return result
}

export async function handleBalancesTransferEvent(event: SubstrateEvent) {
    const [from, to, amount] = event.event.data
    let receiver: string 

    if (!from || !to) {
        logger.error(
            'Some of the from or to address is null',
            JSON.stringify(event.toHuman())
        )
        return
    }

    const otherEvents = event.extrinsic?.events?.findIndex(
        (item) => item.event.method === 'ContractEmitted'
    )

    let idWithProposal: string
    if (otherEvents && otherEvents !== -1) {
        logger.info('ContractEmitted event found')
        const payloadDataAddress =
            event.extrinsic?.extrinsic?.args[4]?.toString()

        const hexReceiver = payloadDataAddress?.split('x')?.pop()
        if (hexReceiver) {
            logger.info('Receiver address found in payload ' + hexReceiver)
            const rawReceiver = Buffer.from(hexReceiver, 'hex').toString()
            logger.info('Receiver address in raw format ' + rawReceiver)
            receiver = '0x' + rawReceiver.split('x').pop()
            logger.info('Receiver address in polkadot format ' + receiver)
        }

        idWithProposal = `${event.block?.block?.header?.number?.toNumber()}-${event.idx}`
    }

    let records = getEntityByTxType(event)

    const allBalanceTransfer = new AllBalanceTransfer(
        `${event.block.block.header.number.toNumber()}-${event.idx}`,
        '',
        ''
    )

    records.push(
        allBalanceTransfer
    )

    const inRangeTimestamp = Math.floor(
        event.extrinsic!.block.timestamp!.getTime() / 1000
    )

    records.forEach(record => {
        record.id = idWithProposal || `${event.block.block.header.number.toNumber()}-${event.idx}`
        record.blockNumber = event.block.block.header.number.toBigInt()
        record.from = from.toString()
        record.to = receiver || to.toString()
        record.amount = (amount as Balance).toBigInt()
        if (event.extrinsic) {
            record.txHash = event.extrinsic.extrinsic.hash.toString()
            record.timestamp = BigInt(inRangeTimestamp)
        }
    } )

    return Promise.all(records.map(record => record.save()))
}
