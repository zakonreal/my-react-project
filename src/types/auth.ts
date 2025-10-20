// Интерфейс пользователя - основные данные пользователя системы
export interface User {
    id: number;
    username: string;
    isAdmin: boolean;
}

// Данные формы входа
export interface LoginFormData {
    username: string;
    password: string;
}

// Данные формы регистрации
export interface RegisterFormData {
    username: string;
    password: string;
    passwordConfirm: string;
    isAdmin: boolean;
}

// Контекст аутентификации - управление состоянием пользователя в приложении
export interface AuthContextType {
    currentUser: User | null;

    // Функция входа в систему
    login: (username: string, password: string) => {
        success: boolean;
        message?: string
    };

    // Функция регистрации нового пользователя
    register: (username: string, password: string, isAdmin: boolean) => {
        success: boolean;
        message?: string
    };

    // Функция выхода из системы
    logout: () => void;

    // Обновление статуса администратора (для переключателя)
    updateAdminStatus: (isAdmin: boolean) => void;
}