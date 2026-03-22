import database from "../config/database.js"

export const inactiveAccout = async (userId: string): Promise<void> => {
    await database.user.update({
        where: { id: userId },
        data: { inactive: true, lastUpdate: new Date() }
    });
}