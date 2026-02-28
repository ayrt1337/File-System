import database from "../config/database.js";
import { User } from "../types/user.js";

export const updateAccout = async (user: User) => {
    await database.user.update({
        where: { email: user.email },
        data: {
            name: user.name,
            email: user.email,
            password: user.password
        }
    });
}