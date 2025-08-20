import { User } from "./user";

export type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}