import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '../authHooks'
import { Provider } from 'react-redux'
import { store } from '../../stores/store'
import { ReactNode } from 'react'

// Обертка для провайдера Redux
const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
)

describe('useAuth Hook', () => {
    it('возвращает текущего пользователя и функции', () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Проверяем, что хук возвращает ожидаемые свойства
        expect(result.current).toHaveProperty('currentUser')
        expect(result.current).toHaveProperty('login')
        expect(result.current).toHaveProperty('logout')
        expect(result.current).toHaveProperty('register')
        expect(result.current).toHaveProperty('updateAdminStatus')
    })

    it('функции могут быть вызваны', () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Проверяем, что функции могут быть вызваны без ошибок
        expect(() => result.current.login('user', 'pass')).not.toThrow()
        expect(() => result.current.logout()).not.toThrow()
        expect(() => result.current.register('user', 'pass', false)).not.toThrow()
    })
})