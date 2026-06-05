import { ref } from "vue";

export interface User {
    id?: string;
    name?: string;
    email?: string;
    profileImg?: string;
}

const showUser = ref<User>({
    name: "",
    email: "",
    profileImg: ""
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
