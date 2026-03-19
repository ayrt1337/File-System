import database from "../config/database.js";

export const expireCookie = (): void => {
    try {
        setInterval(async () => {
            await database.cookie.deleteMany({
                where: {
                    maxAge: {
                        lt: new Date()
                    }
                }
            });
        }, 3 * 60 * 1000);
    } catch (error) {
        console.log("Erro na expiração de cookies: ", error.message);
    }
}