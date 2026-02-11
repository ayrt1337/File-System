import jwt from "jsonwebtoken";

export const genToken = (): string => {
    const token = jwt.sign({
        data: "Token Data"
    },
        "secret_key", { expiresIn: "10m" }
    );
    return token;
}

export const verifyToken = (token: string) => {
    const verify = jwt.verify(token, "secret_key");
    return verify;
}