/// <reference types="cypress" />

describe('Навигация по приложению', () => {
    beforeEach(() => {
        // Логинимся напрямую перед каждым тестом
        cy.visit('/login')
        cy.get('input[name="username"]').type('user1')
        cy.get('input[name="password"]').type('user1')
        cy.get('button[type="submit"]').click()

        // Ждем загрузки главной страницы
        cy.url().should('include', '/')
        cy.contains('Добро пожаловать').should('be.visible')
    })

    it('переход на страницу карточек', () => {
        cy.contains('Карточки').click()
        cy.url().should('include', '/cards')
        cy.contains('Посты - Карточки').should('be.visible')
    })

    it('переход на страницу таблицы', () => {
        cy.contains('Таблица').click()
        cy.url().should('include', '/table')
        cy.contains('Посты - Таблица').should('be.visible')
    })

    it('выход из системы', () => {
        cy.contains('Выйти').click()
        cy.url().should('include', '/login')
    })
})