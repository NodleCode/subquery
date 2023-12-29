import { Account } from "../types";

export async function checkAccountData(account: string): Promise<Account> {
    const acc = await Account.get(account);
    if (acc) {
        return acc;
    }
    const newAcc = new Account(account);
    newAcc.isAlive = true;
    return newAcc
}