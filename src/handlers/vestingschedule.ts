import { SubstrateExtrinsic } from '@subql/types'
import { VestingScheduleAdded } from '../types'
import { VestingData } from '../types'

export class VestingScheduleHandler {
  private extrinsic: SubstrateExtrinsic 

  constructor(extrinsic: SubstrateExtrinsic) {
    this.extrinsic = extrinsic
  }

  // get data () {
  //   return this.event.event.data
  // }

  get signer() {
    return this.extrinsic.extrinsic.signer.toString()
  }

  get hash () {
    return this.extrinsic.extrinsic.hash.toString()
  }

  get block () {
    return this.extrinsic.block.block.header.number.toNumber()
  }

  get idx () {
    return this.extrinsic.idx
  }

  public async save () {
    let vesting = await VestingScheduleAdded.get(this.signer)

    const data = await api.query.vesting.vestingSchedules(this.signer)

    let vestingData = []

    for(let i = 0; i < data.encodedLength; i++) {
      if(data[i] === undefined) {
        break
      }
      vestingData.push(data[i])
    }

    if(vesting === undefined) {
      vesting = new VestingScheduleAdded(this.signer)
      vesting.data = vestingData
    } else {
      vesting.data = vestingData
    }
    
    await vesting.save()
  }
}
