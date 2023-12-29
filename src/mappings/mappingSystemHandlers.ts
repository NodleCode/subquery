import { SubstrateEvent } from "@subql/types";
import { baseEventHandler } from "../helpers/baseEventHandler";

export const handleNewAccountEvent = async (
  event: SubstrateEvent
) => {
  const account = event.event.data[0].toString();
  await baseEventHandler(event, "newAccounts", account);
}

export const handleKilledAccountEvent = async (
  event: SubstrateEvent
) => {
  const account = event.event.data[0].toString();
  await baseEventHandler(event, "killedAccounts", account);
}