import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Base page object class that provides common functionality for all page objects
 */
export class BasePage {
  protected page: Page;
  readonly baseUrl = 'http://jupiter.cloud.planittesting.com';

  /**
   * Constructor for the BasePage class
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param path - Path to append to base URL
   */
  async navigate(path: string = ''): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  /**
   * Get page title
   * @returns Promise resolving to the page title
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    logger.info(`Page title: ${title}`);
    return title;
  }

  /**
   * Click on an element
   * @param selector - Element selector
   */
  async click(selector: string): Promise<void> {
    logger.info(`Clicking element: ${selector}`);
    await this.page.click(selector);
  }

  /**
   * Fill a form field
   * @param selector - Form field selector
   * @param value - Value to fill
   */
  async fill(selector: string, value: string): Promise<void> {
    logger.info(`Filling ${selector} with value: ${value}`);
    await this.page.fill(selector, value);
  }

  /**
   * Get text content from an element
   * @param selector - Element selector
   * @returns Promise resolving to the element text or null
   */
  async getText(selector: string): Promise<string | null> {
    const text = await this.page.textContent(selector);
    logger.info(`Text content of ${selector}: ${text}`);
    return text;
  }

  /**
   * Wait for element to be visible
   * @param selector - Element selector
   */
  async waitForElement(selector: string): Promise<Locator> {
    logger.info(`Waiting for element: ${selector}`);
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return element;
  }

  /**
   * Check if element is visible
   * @param selector - Element selector
   * @returns Promise resolving to boolean indicating visibility
   */
  async isVisible(selector: string): Promise<boolean> {
    logger.info(`Checking if element is visible: ${selector}`);
    const element = this.page.locator(selector);
    return await element.isVisible();
  }

  /**
   * Get element count
   * @param selector - Element selector
   * @returns Promise resolving to the count of matching elements
   */
  async getElementCount(selector: string): Promise<number> {
    const count = await this.page.locator(selector).count();
    logger.info(`Element count for ${selector}: ${count}`);
    return count;
  }
}