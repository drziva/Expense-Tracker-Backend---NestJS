export type LoginResponse = {
    access_token: string;
    user: { 
        id: number; 
        username: string;
        email: string;
    };
}
