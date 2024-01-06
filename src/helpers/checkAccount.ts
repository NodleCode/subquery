import moment from "moment";
import { AccountInfo } from "../types";

export async function checkAccountData(account: string, date: Date): Promise<AccountInfo> {
    const acc = await AccountInfo.get(`${account}-${moment(date).format('DD/MM/YYYY')}`);
    if (acc) {
        return acc;
    }
    const newAcc = new AccountInfo(`${account}-${moment(date).format('DD/MM/YYYY')}`, date, account);
    newAcc.isAlive = 1;
    return newAcc
}
