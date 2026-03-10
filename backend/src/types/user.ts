export interface User{
    id?: number,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    lastUpdate: Date
    inactive: boolean
};