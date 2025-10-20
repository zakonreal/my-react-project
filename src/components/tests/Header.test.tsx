import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from '../Header'
import { BrowserRouter } from 'react-router'

// Мокаем все зависимости
const mockUseAuth = vi.fn()
vi.mock('../../hooks/authHooks', () => ({ useAuth: () => mockUseAuth() }))
vi.mock('../ThemeToggle', () => ({ ThemeToggle: () => <div>Theme Toggle</div> }))
vi.mock('../AdminToggle', () => ({ AdminToggle: () => <div>Admin Toggle</div> }))
vi.mock('react-router', async () => ({
    ...(await vi.importActual('react-router')),
    useLocation: () => ({ pathname: '/cards' }),
    useNavigate: () => vi.fn(),
}))

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('отображает заголовок и кнопки для авторизованного пользователя', () => {
        mockUseAuth.mockReturnValue({
            currentUser: { username: 'testuser', isAdmin: false },
            logout: vi.fn(),
        })

        render(
            <BrowserRouter>
                <Header title="My App" />
            </BrowserRouter>
        )

        expect(screen.getByText('My App')).toBeInTheDocument()
        expect(screen.getByText('Выйти')).toBeInTheDocument()
        expect(screen.getByText('Theme Toggle')).toBeInTheDocument()
        expect(screen.getByText('Admin Toggle')).toBeInTheDocument()
    })

    it('вызывает logout при клике на кнопку выхода', () => {
        const mockLogout = vi.fn()
        mockUseAuth.mockReturnValue({
            currentUser: { username: 'user', isAdmin: false },
            logout: mockLogout,
        })

        render(
            <BrowserRouter>
                <Header title="My App" />
            </BrowserRouter>
        )

        fireEvent.click(screen.getByText('Выйти'))
        expect(mockLogout).toHaveBeenCalledTimes(1)
    })
})