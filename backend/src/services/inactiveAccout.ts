import database from "../config/database.js"
import { updateAccout } from "./update-accout.js";

export const inactiveAccout = async (userId: string): Promise<void> => {
    await deleteManyCookie(userId);
    await updateAccout({ id: Number(userId), inactive: true });
}

const deleteManyCookie = async (userId: string): Promise<void> => {
    await database.cookie.deleteMany({
        where: { userId: Number(userId) }
    });
}