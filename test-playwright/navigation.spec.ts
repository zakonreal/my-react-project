import { test, expect } from '@playwright/test'

test.describe('Навигация по приложению', () => {
    test('успешный вход и навигация', async ({ page }) => {
        // Переходим на страницу логина
        await page.goto('/login')

        // Заполняем форму логина
        await page.fill('input[name="username"]', 'user1')
        await page.fill('input[name="password"]', 'user1')
        await page.click('button[type="submit"]')

        // Ждем редиректа на главную страницу
        await page.waitForURL('**/')

        // Проверяем приветствие
        await expect(page.getByText('Добро пожаловать')).toBeVisible()

        // Переходим на страницу карточек
        await page.getByText('Карточки').click()
        await page.waitForURL('**/cards')

        // Проверяем заголовок страницы карточек
        await expect(page.getByText('Посты - Карточки')).toBeVisible()

        // Возвращаемся на главную
        await page.getByText('На главную').click()
        await page.waitForURL('**/')
    })

    test('просмотр деталей поста', async ({ page }) => {
        // Логинимся и переходим к карточкам
        await page.goto('/login')
        await page.fill('input[name="username"]', 'admin')
        await page.fill('input[name="password"]', 'admin')
        await page.click('button[type="submit"]')
        await page.waitForURL('**/')
        await page.getByText('Карточки').click()
        await page.waitForURL('**/cards')

        // Ждем загрузки карточек
        await page.waitForSelector('.MuiCard-root')

        // Проверяем что есть хотя бы одна карточка
        const cardCount = await page.locator('.MuiCard-root').count()
        expect(cardCount).toBeGreaterThan(0)

        // Кликаем на первую карточку
        await page.locator('.MuiCard-root').first().click()

        // Проверяем, что перешли на страницу поста
        await page.waitForURL('**/post/**')

        // Проверяем что есть заголовок (может быть h1, h2, h3, h4)
        await expect(page.locator('h1, h2, h3, h4').first()).toBeVisible()

        // Проверяем что есть рейтинг или описание
        await expect(page.getByText(/рейтинг|описание|rating|description/i).first()).toBeVisible()
    })

    test('переход на страницу таблицы', async ({ page }) => {
        // Логинимся
        await page.goto('/login')
        await page.fill('input[name="username"]', 'user1')
        await page.fill('input[name="password"]', 'user1')
        await page.click('button[type="submit"]')
        await page.waitForURL('**/')

        // Переходим на страницу таблицы
        await page.getByText('Таблица').click()
        await page.waitForURL('**/table')

        // Проверяем заголовок и наличие таблицы
        await expect(page.getByText('Посты - Таблица')).toBeVisible()
        await expect(page.locator('table')).toBeVisible()

        // Ждем загрузки данных в таблицу
        await page.waitForSelector('tbody tr')

        // Проверяем что в таблице есть строки (вместо фиксированного числа)
        const rowCount = await page.locator('tbody tr').count()
        expect(rowCount).toBeGreaterThan(0)

        // Проверяем что есть заголовки таблицы
        await expect(page.getByText('Изображение')).toBeVisible()
        await expect(page.getByText('Заголовок')).toBeVisible()
        await expect(page.getByText('Описание')).toBeVisible()
        await expect(page.getByText('Рейтинг')).toBeVisible()
    })

    test('выход из системы', async ({ page }) => {
        // Логинимся
        await page.goto('/login')
        await page.fill('input[name="username"]', 'admin')
        await page.fill('input[name="password"]', 'admin')
        await page.click('button[type="submit"]')
        await page.waitForURL('**/')

        // Выходим из системы
        await page.getByText('Выйти').click()
        await page.waitForURL('**/login')

        // Проверяем что оказались на странице логина
        await expect(page.getByText('Вход в систему')).toBeVisible()
    })
})