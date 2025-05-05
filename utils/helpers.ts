import { Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Wait for a specified amount of time
 * @param ms - Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const wait = async (ms: number): Promise<void> => {
  logger.info(`Waiting for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate a random string of specified length
 * @param length - Length of the string to generate
 * @returns Random string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a random email
 * @returns Random email
 */
export const generateRandomEmail = (): string => {
  const domains = ['example.com', 'test.com', 'mail.com', 'email.com'];
  const username = generateRandomString(8).toLowerCase();
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
};

/**
 * Take a screenshot and save it with a specified name
 * @param page - Playwright page object
 * @param screenshotName - Name for the screenshot file
 */
export const takeScreenshot = async (page: Page, screenshotName: string): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${screenshotName}_${timestamp}.png`;
  logger.info(`Taking screenshot: ${filename}`);
  await page.screenshot({ path: `./screenshots/${filename}`, fullPage: true });
};

/**
 * Format currency value as a string
 * @param value - Numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

/**
 * Parse currency string to number
 * @param currencyStr - Currency string to parse
 * @returns Parsed numeric value
 */
export const parseCurrency = (currencyStr: string): number => {
  return parseFloat(currencyStr.replace(/[^0-9.]/g, ''));
};

/**
 * Calculate expected subtotal
 * @param price - Price of the product
 * @param quantity - Quantity of the product
 * @returns Expected subtotal
 */
export const calculateSubtotal = (price: number, quantity: number): number => {
  return parseFloat((price * quantity).toFixed(2));
};

/**
 * Check if two numeric values are approximately equal
 * @param a - First value
 * @param b - Second value
 * @param epsilon - Maximum allowed difference (default: 0.01)
 * @returns Boolean indicating if values are approximately equal
 */
export const isApproximatelyEqual = (a: number, b: number, epsilon: number = 0.01): boolean => {
  return Math.abs(a - b) < epsilon;
};