import { useAppDispatch, useAppSelector } from './reduxHooks';
import { toggleTheme, setTheme } from '../stores/themeSlice';

// Хук для работы с темой приложения
export const useTheme = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((state) => state.theme.theme);

    return {
        theme,
        toggleTheme: () => dispatch(toggleTheme()),
        setTheme: (theme: 'light' | 'dark') => dispatch(setTheme(theme)),
    };
};