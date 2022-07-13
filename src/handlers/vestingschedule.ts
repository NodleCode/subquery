import { SubstrateExtrinsic } from '@subql/types'
import { checkIfExtrinsicExecuteSuccess } from '../helpers'
import { VestingData, VestingSchedule } from '../types'

export class VestingScheduleHandler {
  private extrinsic: SubstrateExtrinsic 

  constructor(extrinsic: SubstrateExtrinsic) {
    this.extrinsic = extrinsic
  }

  get args () {
    return this.extrinsic.extrinsic.args
  }

  get hash () {
    return this.extrinsic.extrinsic.hash.toString()
  }

  get signer () {
    return this.extrinsic.extrinsic.signer.toString()
  }

  get block () {
    return this.extrinsic.block.block.header.number.toString()
  }

  get idx () {
    return this.extrinsic.idx
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
