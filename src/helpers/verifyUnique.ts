import { Collection, Item } from "../types";
import { Codec } from "@polkadot/types/types";

type EnsureCollection = {
  idx: number;
  blockNumber: number;
  collectionId: Codec;
  timestamp: Date;
};

type EnsureItem = EnsureCollection & {
  itemId: Codec;
  collectionFkey: string;
};

export const ensureCollection = async ({
  collectionId,
  blockNumber,
  idx,
  timestamp,
}: EnsureCollection) => {
    const collectionIdAsNumber = Number(collectionId.toString());
    const collections = await Collection.getByCollectionId(collectionIdAsNumber);
    let collection = collections?.find((c) => !c.isDestroyed);

    if (!collection) {
        const id = `${collectionIdAsNumber}-${blockNumber}-${idx}`;
        logger.warn('Collection not found, creating new collection', collectionIdAsNumber);
        collection = new Collection(id, collectionIdAsNumber, '', '', '', false);
        collection.createdAt = BigInt(timestamp.getTime());
    }

    collection.updatedAt = BigInt(timestamp.getTime());
    return collection;
}

export const ensureItem = async ({
  collectionId,
  itemId,
  blockNumber,
  idx,
  collectionFkey,
  timestamp,
}: EnsureItem) => {
    const itemIdString = itemId.toString();
    const items = await Item.getByCollectionItemKey(`${collectionId}-${itemIdString}`);
    let item = items?.find((c) => !c.isBurned);

    if (!item) {
        const id = `${collectionId}-${itemIdString}-${blockNumber}-${idx}`;
        logger.warn('Item not found, creating new item', itemIdString);
        item = new Item(id, Number(itemIdString), `${collectionId}-${itemIdString}`, collectionFkey, false);
        item.createdAt = BigInt(timestamp.getTime());
    }
    
    item.updatedAt = BigInt(timestamp.getTime());
    return item;
}
