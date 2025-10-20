import { test, expect } from '@playwright/test'

test('создание нового поста', async ({ page }) => {
    // Логинимся
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'admin')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')

    // Открываем модальное окно создания поста
    await page.getByRole('button', { name: 'Создать новый пост' }).click()

    // Ждем появления модального окна
    await expect(page.getByRole('heading', { name: 'Создать новый пост' })).toBeVisible()

    // Заполняем форму
    await page.fill('input[name="title"]', 'Тестовый пост Playwright')
    await page.fill('textarea[name="body"]', 'Это тестовое описание поста созданного через Playwright')
    await page.fill('input[name="url"]', 'https://example.com/image.jpg')
    await page.fill('input[name="rate"]', '8')

    // Отправляем форму
    await page.click('button[type="submit"]')

    // Ждем либо закрытия модального окна, либо появления ошибки
    try {
        // Ждем закрытия модального окна (успешный сценарий)
        await expect(page.getByRole('heading', { name: 'Создать новый пост' })).not.toBeVisible({ timeout: 10000 })
        console.log('Модальное окно успешно закрылось')
    } catch (error) {
        // Если модальное окно не закрылось, проверяем наличие ошибок
        console.log('Модальное окно не закрылось, проверяем ошибки...')

        // Проверяем наличие сообщений об ошибке
        const errorAlert = page.getByRole('alert')
        if (await errorAlert.isVisible()) {
            const errorText = await errorAlert.textContent()
            console.log('Найдена ошибка:', errorText)
            throw new Error(`Ошибка при создании поста: ${errorText}`)
        }

        // Проверяем валидационные ошибки в полях
        const validationErrors = page.locator('.MuiFormHelperText-root.Mui-error')
        const errorCount = await validationErrors.count()
        if (errorCount > 0) {
            console.log(`Найдено ${errorCount} ошибок валидации:`)
            for (let i = 0; i < errorCount; i++) {
                const errorText = await validationErrors.nth(i).textContent()
                console.log(`- ${errorText}`)
            }
            throw new Error('Есть ошибки валидации формы')
        }

        // Если нет явных ошибок, но форма не отправляется
        throw new Error('Форма не отправляется, но ошибок не видно')
    }

    // Проверяем что остались на главной странице
    await expect(page.getByText('Добро пожаловать')).toBeVisible()
})