import { SubstrateExtrinsic } from '@subql/types'
import { Balance } from '@polkadot/types/interfaces/runtime'
import { Account, Pot, PotBalance } from '../types'

const createUserObj = (userId: string) => {
    const user = new Account(userId, userId)
    user.createdAt = Date.now()
    user.updatedAt = Date.now()

    return user
}

export async function handleSponsorshipCreatePotCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipCreatePotCall')
    if (!extrinsic.success) return

    const [potId, sponsorship_type, fee_quota, reserve_quota] =
        extrinsic.extrinsic.args

    const args = {
        pot: potId.toString(),
        fee_quota: (fee_quota as Balance).toBigInt(),
        reserve_quota: (reserve_quota as Balance).toBigInt(),
        sponsorship_type: sponsorship_type.toString(),
    }

    const owner = extrinsic.extrinsic.signer.toString()
    const id = args.pot

    const pot = new Pot(
        id,
        Number(args.pot),
        owner,
        args.fee_quota,
        args.reserve_quota,
        args.sponsorship_type
    )

    pot.createdAt = extrinsic.block.timestamp.getTime()
    pot.updatedAt = extrinsic.block.timestamp.getTime()

    return pot.save()
}

export async function handleSponsorshipRegisterUsersCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipRegisterUsersCall')
    if (!extrinsic.success) return

    const [potId, users, common_fee_quota, common_reserve_quota] =
        extrinsic.extrinsic.args

    const args = {
        pot: potId.toString(),
        users: users.toHuman() as string[],
        common_fee_quota: (common_fee_quota as Balance).toBigInt(),
        common_reserve_quota: (common_reserve_quota as Balance).toBigInt(),
    }

    const pot = await Pot.get(args.pot)

    if (!pot) {
        logger.error('Pot not found')
        return
    }
    logger.debug('Pot found')

    await store.bulkCreate(`Account`, args.users.map(createUserObj))

    const accounts = args.users

    return store.bulkCreate(
        `PotBalance`,
        accounts.map((userId) => ({
            id: `${pot.id}-${userId}`,
            potId: pot.id,
            accountId: userId,
            feeQuota: args.common_fee_quota,
            reserveQuota: args.common_reserve_quota,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }))
    )
}

export async function handleSponsorshipRemoveUsersCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipRemoveUsersCall')
    if (!extrinsic.success) return

    const args = {
        pot: extrinsic.extrinsic.args[0].toString(),
        users: extrinsic.extrinsic.args[1].toHuman() as string[],
    }

    const accounts = args.users

    return store.bulkRemove(
        `PotBalance`,
        accounts.map((userId) => `${args.pot}-${userId}`)
    )
}

export async function handleSponsorshipUpdatePotLimitsCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipUpdatePotLimitsCall')
    if (!extrinsic.success) return

    const args = {
        pot: extrinsic.extrinsic.args[0].toString(),
        new_fee_quota: (extrinsic.extrinsic.args[1] as Balance).toBigInt(),
        new_reserve_quota: (extrinsic.extrinsic.args[2] as Balance).toBigInt(),
    }

    const pot = await Pot.get(args.pot)

    if (!pot) return

    pot.feeQuota = args.new_fee_quota
    pot.reserveQuota = args.new_reserve_quota
    pot.updatedAt = extrinsic.block.timestamp.getTime()

    return pot.save()
}

export async function handleSponsorshipUpdateSponsorshipTypeCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipUpdateSponsorshipTypeCall')
    if (!extrinsic.success) return

    const args = {
        pot: extrinsic.extrinsic.args[0].toString(),
        sponsorship_type: extrinsic.extrinsic.args[1].toString(),
    }

    const pot = await Pot.get(args.pot)

    if (!pot) return

    pot.sponsorshipType = args.sponsorship_type
    pot.updatedAt = extrinsic.block.timestamp.getTime()

    return pot.save()
}

export async function handleSponsorshipUpdateUsersLimitsCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipUpdateUsersLimitsCall')
    if (!extrinsic.success) return

    const [potId, new_fee_quota, new_reserve_quota, users] =
        extrinsic.extrinsic.args

    const args = {
        pot: potId.toString(),
        users: users.toHuman() as string[],
        new_fee_quota: (new_fee_quota as Balance).toBigInt(),
        new_reserve_quota: (new_reserve_quota as Balance).toBigInt(),
    }

    const accounts = args.users

    const pot = await Pot.get(args.pot)

    if (!pot) return

    return Promise.all(
        accounts.map((userId) => {
            return store.set('PotBalance', `${args.pot}-${userId}`, {
                id: `${args.pot}-${userId}`,
                accountId: userId,
                potId: args.pot,
                feeQuota: args.new_fee_quota,
                reserveQuota: args.new_reserve_quota,
                updatedAt: Date.now(),
            } as PotBalance)
        })
    )
}

export async function handleSponsorshipRemovePotCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipRemovePotCall')
    if (!extrinsic.success) return

    const args = {
        pot: extrinsic.extrinsic.args[0].toString(),
    }

    // remove PotBalance with potId = args.pot

    await store.bulkRemove(
        `PotBalance`,
        (
            await store.getByField(`PotBalance`, 'potId', args.pot)
        ).map((item) => item.id)
    )

    return store.remove(`Pot`, args.pot)
}

export async function handleSponsorshipSponsorForCall(
    extrinsic: SubstrateExtrinsic
) {
    logger.debug('handleSponsorshipSponsorForCall')

    const args = {
        pot: extrinsic.extrinsic.args[0].toString(),
        call: extrinsic.extrinsic.args[1].toHuman(),
    }
    const pot = await Pot.get(args.pot)

    if (!pot) return

    const caller = extrinsic.extrinsic.signer.toString()
    const potBalance = await PotBalance.get(`${args.pot}-${caller}`)

    const [apiUser, apiPot] = await Promise.all([
        api.query.sponsorship.user(args.pot, caller),
        api.query.sponsorship.pot(args.pot),
    ])

    const apiUserAsHuman = apiUser.toJSON() as any

    const apiPotAsHuman = apiPot.toJSON() as any

    if (potBalance && apiUserAsHuman) {
        const newFeeQuota =
            BigInt(apiUserAsHuman.feeQuota.limit) -
            BigInt(apiUserAsHuman.feeQuota.balance)
        const newReserveQuota =
            BigInt(apiUserAsHuman.reserveQuota.limit) -
            BigInt(apiUserAsHuman.reserveQuota.balance)
        potBalance.feeQuota = newFeeQuota
        potBalance.reserveQuota = newReserveQuota
        potBalance.updatedAt = extrinsic.block.timestamp.getTime()
    }

    if (apiPotAsHuman) {
        const newFeeQuota =
            BigInt(apiPotAsHuman.feeQuota.limit) -
            BigInt(apiPotAsHuman.feeQuota.balance)
        const newReserveQuota =
            BigInt(apiPotAsHuman.reserveQuota.limit) -
            BigInt(apiPotAsHuman.reserveQuota.balance)
        pot.feeQuota = newFeeQuota
        pot.reserveQuota = newReserveQuota
        pot.updatedAt = extrinsic.block.timestamp.getTime()
    }

    return Promise.all([pot.save(), potBalance?.save()])
}
