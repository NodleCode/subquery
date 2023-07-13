export const eventsMap = {
    "balances": {
        "Transfer": "balanceTransfers",
        "TransferKeepAlive": "balanceTransfers"
    },
    "uniques": {
        "Transferred": "uniquesTransfers",
        "Destroyed": "collectionsDestroyed",
        "Burned": "itemsBurned",
        "Issued": "itemsMinted",
        "Created": "collectionsCreated",
    },
    "system": {
        "NewAccount": "newAccounts",
        "KilledAccount": "killedAccounts",
    },
};