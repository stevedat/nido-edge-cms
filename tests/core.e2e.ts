import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test.describe('Nido Edge CMS - Core Functionality', () => {
	test('App should boot and display the main layout', async ({ app, browser }) => {
		await app.open('/');
		await expect(browser.locator('body')).toBeVisible();
	});
});
