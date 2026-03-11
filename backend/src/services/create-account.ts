import { User } from "../types/user.js";
import database from "../config/database.js";

export const createAccout = async (email: string, password: string) => {
    const user: User = {
        name: "Usuário",
        email: email,
        password: password,
        createdAt: new Date(),
        lastUpdate: new Date(),
        inactive: false
    };

    await database.user.create({
        data: { ...user }
    });
}