import { User } from "../types/user.js";
import database from "../config/database.js";

export const createAccout = async (email: string, password: string) => {
    const user: User = {
        name: "Usuário",
        email: email,
        password: password
    };

    await database.user.create({
        data: {
            name: user.name,
            email: user.email,
            password: user.password
        }
    });
}