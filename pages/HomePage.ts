import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * Page object for the Home page
 */
export class HomePage extends BasePage {
  // Navigation selectors from the HTML

  private readonly shopNavLink = '#nav-shop';
  private readonly contactNavLink = '#nav-contact';
  private readonly cartNavLink = '#nav-cart';
  
  // Content selectors
  private readonly startShoppingButton = '.btn-large';

  /**
   * Constructor for the HomePage class
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the home page
   */
  async navigateToHome(): Promise<void> {
    logger.info('Navigating to home page');
    await this.navigate('/');
  }

  /**
   * Navigate to the shop page
   */
  async navigateToShop(): Promise<void> {
    logger.info('Navigating to shop page');
    await this.click(this.shopNavLink);
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/shop');
  }

  /**
   * Navigate to the contact page
   */
  async navigateToContact(): Promise<void> {
    logger.info('Navigating to contact page');
    await this.click(this.contactNavLink);
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/contact');
  }

  /**
   * Navigate to the cart page
   */
  async navigateToCart(): Promise<void> {
    logger.info('Navigating to cart page');
    await this.click(this.cartNavLink);
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/cart');
  }

  /**
   * Click the Start Shopping button
   */
  async clickStartShopping(): Promise<void> {
    logger.info('Clicking Start Shopping button');
    await this.click(this.startShoppingButton);
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/shop');
  }
}