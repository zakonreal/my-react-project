/// <reference types="cypress" />

describe('Авторизация пользователя', () => {
    beforeEach(() => {
        // Переходим на страницу логина перед каждым тестом
        cy.visit('/login')
    })

    it('успешный вход в систему', () => {
        // Заполняем форму логина
        cy.get('input[name="username"]').type('user1')
        cy.get('input[name="password"]').type('user1')

        // Нажимаем кнопку входа
        cy.get('button[type="submit"]').click()

        // Ждем редиректа
        cy.url().should('include', '/')

        // Проверяем, что отображается приветствие
        cy.contains('Добро пожаловать').should('be.visible')
    })

    it('показывает ошибку при неверных данных', () => {
        cy.get('input[name="username"]').type('wronguser')
        cy.get('input[name="password"]').type('wrongpass')
        cy.get('button[type="submit"]').click()

        // Проверяем разные возможные селекторы по очереди
        cy.get('body').then(($body) => {
            // Проверяем наличие Alert компонента
            if ($body.find('[role="alert"]').length > 0) {
                cy.get('[role="alert"]').should('be.visible')
            }
            // Проверяем Material-UI Alert
            else if ($body.find('.MuiAlert-root').length > 0) {
                cy.get('.MuiAlert-root').should('be.visible')
            }
            // Проверяем по тексту
            else if ($body.text().match(/ошибка/i)) {
                cy.contains(/ошибка/i).should('be.visible')
            }
            // Если ничего не нашли, проверяем что остались на странице логина
            else {
                cy.url().should('include', '/login')
                cy.contains('Вход в систему').should('be.visible')
            }
        })
    })

    it('переход на страницу регистрации', () => {
        // Нажимаем ссылку "Зарегистрироваться" - используем точный текст
        cy.contains('Нет аккаунта? Зарегистрироваться').click()

        // Проверяем переход на страницу регистрации
        cy.url().should('include', '/register')
        cy.contains('Регистрация').should('be.visible')
    })
})