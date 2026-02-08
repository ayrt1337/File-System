import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
    const salt = 10;
    return bcrypt.hash(password, salt);
}