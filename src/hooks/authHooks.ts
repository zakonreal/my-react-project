import { useAppDispatch, useAppSelector } from './reduxHooks';
import { loginUser, registerUser, logoutUser, updateAdminStatus, clearError } from '../stores/authSlice';

// Хук для работы с аутентификацией
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { currentUser, isLoading, error } = useAppSelector((state) => state.auth);

    return {
        currentUser,
        isLoading,
        error,
        login: (username: string, password: string) =>
            dispatch(loginUser({ username, password })),
        register: (username: string, password: string, isAdmin: boolean) =>
            dispatch(registerUser({ username, password, isAdmin })),
        logout: () => dispatch(logoutUser()),
        updateAdminStatus: (isAdmin: boolean) => dispatch(updateAdminStatus(isAdmin)),
        clearError: () => dispatch(clearError()),
    };
};