import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Login } from '../Login'
import { BrowserRouter } from 'react-router'

// Создаем мок функцию
const mockUseAuth = vi.fn()

// Мокаем хук useAuth
vi.mock('../../hooks/authHooks', () => ({
    useAuth: () => mockUseAuth(),
}))

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Базовая реализация useAuth
        mockUseAuth.mockReturnValue({
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateAdminStatus: vi.fn(),
            clearError: vi.fn(),
            currentUser: null,
            isLoading: false,
            error: null,
        })
    })

    it('рендерит форму входа', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        )

        expect(screen.getByText('Вход в систему')).toBeInTheDocument()

        // Используем getByPlaceholderText для полей ввода
        expect(screen.getByRole('textbox', { name: /имя пользователя/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    })

    it('отправляет данные формы', () => {
        const mockLogin = vi.fn()
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            register: vi.fn(),
            logout: vi.fn(),
            updateAdminStatus: vi.fn(),
            clearError: vi.fn(),
            currentUser: null,
            isLoading: false,
            error: null,
        })

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        )

        // Заполняем форму - используем getByRole для текстовых полей
        const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i })
        const passwordInput = screen.getByLabelText(/пароль/i)

        fireEvent.change(usernameInput, {
            target: { value: 'testuser' }
        })
        fireEvent.change(passwordInput, {
            target: { value: 'password123' }
        })

        // Отправляем форму
        fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

        // Проверяем вызов login с правильными данными
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
    })

    it('показывает ошибку', () => {
        mockUseAuth.mockReturnValue({
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateAdminStatus: vi.fn(),
            clearError: vi.fn(),
            currentUser: null,
            isLoading: false,
            error: 'Ошибка входа',
        })

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        )

        expect(screen.getByText('Ошибка входа')).toBeInTheDocument()
    })

    it('показывает загрузку', () => {
        mockUseAuth.mockReturnValue({
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            updateAdminStatus: vi.fn(),
            clearError: vi.fn(),
            currentUser: null,
            isLoading: true,
            error: null,
        })

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        )

        expect(screen.getByText('Вход...')).toBeInTheDocument()
        expect(screen.getByText('Вход...')).toBeDisabled()
    })
})