import { baseEventHandler } from '../helpers/baseEventHandler';
import { SubstrateEvent } from "@subql/types";

export async function handleUniquesTransferEvent(
  event: SubstrateEvent
) {
  await baseEventHandler(event, "uniquesTransfers");
}

export const handleUniquesDestroyedEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "collectionsDestroyed");
}

export const handleUniquesBurnedEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "itemsBurned");
}

export const handleUniquesIssuedEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "itemsMinted");
}

export const handleUniquesCreatedEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "collectionsCreated");
}
