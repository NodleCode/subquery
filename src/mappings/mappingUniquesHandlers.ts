import { baseEventHandler } from '../helpers/baseEventHandler';
import { SubstrateEvent } from "@subql/types";

export async function handleUniquesTransferEvent(
  event: SubstrateEvent
) {
  const caller = event.extrinsic?.extrinsic.signer.toString();
  await baseEventHandler(event, "uniquesTransfers", caller);
}

export const handleUniquesDestroyedEvent = async (
  event: SubstrateEvent
) => {
  const caller = event.extrinsic?.extrinsic.signer.toString();
  await baseEventHandler(event, "collectionsDestroyed", caller);
}

export const handleUniquesBurnedEvent = async (
  event: SubstrateEvent
) => {
  const caller = event.extrinsic?.extrinsic.signer.toString();
  await baseEventHandler(event, "itemsBurned", caller);
}

export const handleUniquesIssuedEvent = async (
  event: SubstrateEvent
) => {
  const caller = event.extrinsic?.extrinsic.signer.toString();
  await baseEventHandler(event, "itemsMinted", caller);
}

export const handleUniquesCreatedEvent = async (
  event: SubstrateEvent
) => {
  const caller = event.extrinsic?.extrinsic.signer.toString();
  await baseEventHandler(event, "collectionsCreated", caller);
}
