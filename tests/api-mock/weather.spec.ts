import { test, expect } from '@playwright/test'

test.describe('Wind values tests', () => {
  const username = 'JohnWeb'
  const password = '123'

  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/websocket-chat-v5.html') // Open the chat page

    const usernameInput = page.getByRole('textbox', { name: 'Username' })
    const passwordInput = page.getByRole('textbox', { name: 'Password' })
    const loginButton = page.getByTestId('login-button')

    await usernameInput.fill(username)
    await passwordInput.fill(password)
    await loginButton.click()
  })

  test('should show wind value mock with all values', async ({ page }) => {
    const customWindValue = '400.0' // Custom wind value for the test

    const mockResponse = {
      params: {
        daysBefore: 0,
        daysAfter: 0,
        location: 'Warsaw',
        date: '2025-04-07',
      },
      weather: [
        {
          date: '2025-04-07',
          location: 'Warsaw',
          temperature: 34,
          condition: 'Sunny',
          icon: 'fa-sun',
          humidity: 79.78,
          wind: `${customWindValue}`, // custom mocked wind value
          feelsLike: 32,
        },
      ],
    }

    await page.route('/api/v2/data/random/weatherToday?location=Warsaw', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      })
    })

    await page.reload() // Reload the page to apply the mock response
    await expect(page.getByTestId('wind')).toBeVisible()
    await expect(page.getByTestId('wind')).toHaveText(`${customWindValue} km/h`)
  })

  const data = ['-100.0', '0.0', '100.0']

  data.forEach((element) => {
    test(`should show wind value mock only wind ${element}`, async ({ page }) => {
      const customWindValue = element
      await page.route('/api/v2/data/random/weatherToday?location=Warsaw', async (route) => {
        const response = await route.fetch()
        const responseJson = await response.json()

        // Modify only the wind value
        responseJson.weather[0].wind = `${customWindValue}`

        // Fulfill with the modified JSON response
        await route.fulfill({
          response,
          body: JSON.stringify(responseJson),
        })
      })

      await page.reload() // Reload the page to apply the mock response
      await expect(page.getByTestId('wind')).toBeVisible()
      await expect(page.getByTestId('wind')).toHaveText(`${customWindValue} km/h`)
    })
  })
})
