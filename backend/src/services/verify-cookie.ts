import database from "../config/database.js";
import { compareHash } from "./hash.js";

export const verifyCookie = async (cookie: string, userId: number) => {
    const cookies = await database.cookie.findMany({
        where: { userId: userId },
        select: { cookie: true }
    });

    for (const userCookie of cookies){
        if(await compareHash(cookie, userCookie.cookie)){
            const user = database.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });

            return user;
        }
    }
    
    return;
}