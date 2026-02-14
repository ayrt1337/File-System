import bcrypt from "bcrypt";

export const hashData = (password: string) => {
    const salt = 10;
    return bcrypt.hash(password, salt);
}

export const compareHash = (password: string, hashPassword: string) => {
    return bcrypt.compare(password, hashPassword);
}