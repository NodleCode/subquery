import { Balance } from '@polkadot/types/interfaces/runtime';
import { baseEventHandler, baseEventHandlerForBN } from '../helpers/baseEventHandler';
import { SubstrateBlock } from "@subql/types";
import { eventsMap } from '../helpers/palletsMap';
import { checkHistoryData } from '../helpers/checkHistoryData';

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  const dataStore = await checkHistoryData(block.timestamp);
  block.block.extrinsics.forEach((_, index) => {
    const events = block.events
      .filter(({ phase }) =>
        phase.isApplyExtrinsic &&
        phase.asApplyExtrinsic.eq(index)
      )
      .map(({ event }) => {
        const { method, section } = event;
        const exist = eventsMap[section]?.[method];
        if (exist || api.events.system.ExtrinsicSuccess.is(event)) {
          return event
        }
      });

    const isSuccess = events?.some((event) => api.events.system.ExtrinsicSuccess.is(event));

    if (isSuccess) {
      return events.map(async (event) => {
        if (!event) return;
        const { method, section, data } = event;
        const key = eventsMap[section]?.[method];
        if (key) {
          if (key === 'balanceTransfers') {
            baseEventHandlerForBN(dataStore, data[2] as Balance, 'amountTranferred');
          }
          return baseEventHandler(dataStore, key);
        }
      });
    }
  })
  await dataStore.save();
}
