import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:8000')
        await page.wait_for_timeout(2000)
        await page.screenshot(path='screenshot_main.png')
        await page.click('#btn-wheel')
        await page.wait_for_timeout(500)
        await page.screenshot(path='screenshot_wheel.png')
        await browser.close()

asyncio.run(run())
