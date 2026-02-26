import database from "../config/database.js";

export const expireCookie = async () => {
    await database.cookie.deleteMany({
        where: {
            maxAge: {
                lt: new Date()
            }
        }
    });
}