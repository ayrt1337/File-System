import database from "../config/database.js";
import { User } from "../types/user.js";

export const updateAccout = async (user: Partial<User>) => {
    await database.user.update({
        where: { id: user.id },
        data: { ...user, lastUpdate: new Date() }
    });
}