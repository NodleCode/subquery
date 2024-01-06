import moment from "moment";
import { History } from "../types";

export async function checkHistoryData(date: Date): Promise<History> {
    const history = await History.get(moment(date).format('DD/MM/YYYY'));
    if (history) {
        return history;
    }
    const newHistory = new History(moment(date).format('DD/MM/YYYY'));
    const totalIssuance = await api.query.balances.totalIssuance();
    newHistory.totalIssuance = (totalIssuance as any).toBigInt();
    newHistory.date = date;
    return newHistory
}