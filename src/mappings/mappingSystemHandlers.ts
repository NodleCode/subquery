import { SubstrateEvent } from "@subql/types";
import { baseEventHandler } from "../helpers/baseEventHandler";

export const handleNewAccountEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "newAccounts");
}

export const handleKilledAccountEvent = async (
  event: SubstrateEvent
) => {
  await baseEventHandler(event, "killedAccounts");
}