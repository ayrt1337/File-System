import database from "../config/database.js";
import { compareHash } from "./hash.js";

const verifyCookie = async (cookie: string, userId: number) => {
    const cookies = await database.cookie.findMany({
        where: { userId: userId },
        select: { cookie: true, user: true }
    });

    for (const userCookie of cookies) {
        if (await compareHash(cookie, userCookie.cookie)) {
            return userCookie.user;
        }
    }

    return;
}

export const verifySession = async (sessionKey: string) => {
    const cookie = sessionKey.substring(0, 36);
    const userId = Number(sessionKey.substring(36));
    const user = await verifyCookie(cookie, userId);
    if (user) {
        return user;
    }
    return;
}