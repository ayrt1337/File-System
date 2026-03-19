import database from "../config/database.js";
import { compareHash } from "./hash.js";

export const deleteCookie = async (cookie: string, userId: number): Promise<void> => {
    const cookies = await database.cookie.findMany({
        where: { userId: userId },
        select: { cookie: true }
    });

    if (cookies.length > 0) {
        for (const cookieElement of cookies) {
            if (await compareHash(cookie, cookieElement.cookie)) {
                await database.cookie.delete({
                    where: { cookie: cookieElement.cookie }
                });
                break;
            }
        }
    }
}