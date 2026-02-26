import database from "../config/database.js";
import { compareHash } from "./hash.js";

export const verifyCookie = async (cookie: string, userId: number) => {
    const cookies = await database.cookie.findMany({
        where: { userId: userId },
        select: { cookie: true, user: true }
    });

    for (const userCookie of cookies) {
        if (await compareHash(cookie, userCookie.cookie)) {
            return userCookie.user.name;
        }
    }

    return;
}