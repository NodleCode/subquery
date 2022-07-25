import { SubstrateEvent } from '@subql/types'
import { checkIfExtrinsicExecuteSuccess } from '../helpers'
import { VestingData, VestingSchedule } from '../types'

export class VestingScheduleHandler {
  private event: SubstrateEvent 

  constructor(event: SubstrateEvent) {
    this.event = event
  }

  get data () {
    return this.event.event.data
  }

  get hash () {
    return this.event.extrinsic.extrinsic.hash.toString()
  }

  get block () {
    return this.event.block.block.header.number.toNumber()
  }

  get idx () {
    return this.event.idx
  }

  public async save () {
    let vesting = await VestingSchedule.get(this.signer)

    const data = await api.query.vesting.vestingSchedules(this.signer)

    let vestingData = []

    for(let i = 0; i < data.encodedLength; i++) {
      if(data[i] === undefined) {
        break
      }
      vestingData.push(data[i])
    }

    if(vesting === undefined) {
      vesting = new VestingSchedule(this.signer)
      vesting.data = vestingData
    } else {
      vesting.data = vestingData
    }
    await vesting.save()
  }
}
