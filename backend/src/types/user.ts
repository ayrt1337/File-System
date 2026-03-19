export interface User{
    id?: number,
    name: string,
    email: string,
    password: string,
    lastUpdate?: Date
    inactive?: boolean
};