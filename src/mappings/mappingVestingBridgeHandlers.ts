import { SubstrateEvent } from '@subql/types'
import { Balance } from '@polkadot/types/interfaces/runtime'
import {
    AllBalanceTransfer,
} from '../types/models'
import { Entity } from '@subql/types-core'

export async function handleBridgeGrants(event: SubstrateEvent) {
    const from = event.extrinsic?.extrinsic.signer.toString()
    const [to, bridgeId, amount, grants] = event.event.data
    logger.error(JSON.stringify(grants))
    logger.info(
        'Bridge grant event' +
        JSON.stringify(event.event.data.toHuman())
    )
    if (!to) {
        logger.error(
            'Some of the from or to address is null',
            JSON.stringify(event.toHuman())
        )
        return
    }
    
    const record = new AllBalanceTransfer(
        `${event.block.block.header.number.toNumber()}-${event.idx}`,
        '',
        ''
    )

    record.id = `${event.block?.block?.header?.number?.toNumber()}-${event.idx}`
    record.blockNumber = event.block.block.header.number.toBigInt()
    record.from = from!
    record.to = to.toString()
    record.amount = (amount as Balance).toBigInt()
    if (event.extrinsic) {
        record.txHash = event.extrinsic.extrinsic.hash.toString()
        record.timestamp = BigInt(event.extrinsic.block.timestamp.getTime())
    }

    const parsedGrants = grants as unknown as any[]
    
    const grantsToSave: any[] = []

    parsedGrants.forEach((grant, i) => {
        grantsToSave.push({
            id: `${record.id}-${i}`,
            start: grant.start.toBigInt(),
            period: grant.period.toBigInt(),
            periodCount: grant.periodCount.toBigInt(),
            perPeriod: grant.perPeriod.toBigInt(),
            createdAt: BigInt(event.extrinsic!.block.timestamp.getTime()),
            updatedAt: BigInt(event.extrinsic!.block.timestamp.getTime()),
            belongsTo: from,
            bridgeId: (bridgeId as Balance).toBigInt(),
            balanceTransferId: record.id,
        })
    })

    store.bulkCreate('GrantBridged', grantsToSave as Entity[])

    return record.save()
}
