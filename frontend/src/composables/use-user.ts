import { ref } from "vue";

export interface User {
    id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
}

const showUser = ref<User>({
    name: "",
    email: "",
    avatarUrl: ""
});

export const useUser = () => {
    const setUser = (user: User) => {
        showUser.value = user;
    };

    return {
        setUser,
        showUser
    };
};
