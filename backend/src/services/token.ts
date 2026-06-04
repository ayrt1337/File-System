import jwt from "jsonwebtoken";

export const genToken = (data: any, expiresIn: number): string => {
    const token = jwt.sign({
        data
    },
        process.env.SECRET_KEY, { expiresIn }
    );
    return token;
}

export const verifyToken = (token: string) => {
    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        return verify;
    } catch {
        return;
    }
}

export const decodeToken = (token: string) => {
    try {
        const decoded = jwt.decode(token);;
        return decoded;
    } catch {
        return;
    } 
}