import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * Page object for the Cart page
 */
export class CartPage extends BasePage {
  // Cart table selectors
  private readonly cartRows = '.cart-item';
  private readonly productName = '.product-title';
  private readonly productPrice = '.product-price';
  private readonly productQuantity = 'input.input-mini';
  private readonly productSubtotal = '.line-price';
  private readonly totalPrice = '.total';
  
  /**
   * Constructor for the CartPage class
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the cart page
   */
  async navigateToCart(): Promise<void> {
    logger.info('Navigating to cart page');
    await this.navigate('/#/cart');
  }

  /**
   * Get all cart items
   * @returns Promise resolving to array of cart items with their details
   */
  async getCartItems(): Promise<CartItem[]> {
    logger.info('Getting all cart items');
    const cartRows = this.page.locator(this.cartRows);
    const count = await cartRows.count();
    
    const items: CartItem[] = [];
    for (let i = 0; i < count; i++) {
      const row = cartRows.nth(i);
      
      const nameElement = row.locator(this.productName);
      const priceElement = row.locator(this.productPrice);
      const quantityElement = row.locator(this.productQuantity);
      const subtotalElement = row.locator(this.productSubtotal);
      
      const name = await nameElement.textContent() || '';
      const priceText = await priceElement.textContent() || '';
      const quantityText = await quantityElement.inputValue();
      const subtotalText = await subtotalElement.textContent() || '';
      
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const quantity = parseInt(quantityText, 10);
      const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
      
      items.push({
        name: name.trim(),
        price,
        quantity,
        subtotal
      });
    }
    
    logger.info(`Found ${items.length} cart items`);
    return items;
  }

  /**
   * Get total price from cart
   * @returns Promise resolving to total price
   */
  async getTotalPrice(): Promise<number> {
    logger.info('Getting total price');
    const totalElement = this.page.locator(this.totalPrice);
    const totalText = await totalElement.textContent();
    
    if (!totalText) {
      const errorMsg = 'Total price not found';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    logger.info(`Total price: $${total}`);
    
    return total;
  }

  /**
   * Calculate sum of all subtotals
   * @returns Promise resolving to sum of subtotals
   */
  async calculateSumOfSubtotals(): Promise<number> {
    logger.info('Calculating sum of subtotals');
    const items = await this.getCartItems();
    
    const sum = items.reduce((total, item) => total + item.subtotal, 0);
    logger.info(`Sum of subtotals: $${sum}`);
    
    return sum;
  }

  /**
   * Verify that subtotal for each product is correct (price * quantity)
   * @returns Promise resolving to verification results for each product
   */
  async verifySubtotals(): Promise<SubtotalVerificationResult[]> {
    logger.info('Verifying subtotals');
    const items = await this.getCartItems();
    
    const results: SubtotalVerificationResult[] = [];
    
    for (const item of items) {
      const expectedSubtotal = parseFloat((item.price * item.quantity).toFixed(2));
      const isCorrect = Math.abs(expectedSubtotal - item.subtotal) < 0.01; // Allow for small floating point differences
      
      results.push({
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        actualSubtotal: item.subtotal,
        expectedSubtotal,
        isCorrect
      });
      
      if (!isCorrect) {
        logger.error(`Subtotal verification failed for ${item.name}: expected $${expectedSubtotal}, actual $${item.subtotal}`);
      }
    }
    
    return results;
  }

  /**
   * Verify that total equals sum of subtotals
   * @returns Promise resolving to boolean indicating if total is correct
   */
  async verifyTotal(): Promise<TotalVerificationResult> {
    logger.info('Verifying total');
    const total = await this.getTotalPrice();
    const sumOfSubtotals = await this.calculateSumOfSubtotals();
    
    const isCorrect = Math.abs(total - sumOfSubtotals) < 0.01; // Allow for small floating point differences
    
    const result = {
      total,
      sumOfSubtotals,
      isCorrect
    };
    
    if (!isCorrect) {
      logger.error(`Total verification failed: expected $${sumOfSubtotals}, actual $${total}`);
    }
    
    return result;
  }
}

/**
 * Interface for cart item details
 */
export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Interface for subtotal verification result
 */
export interface SubtotalVerificationResult {
  productName: string;
  price: number;
  quantity: number;
  actualSubtotal: number;
  expectedSubtotal: number;
  isCorrect: boolean;
}

/**
 * Interface for total verification result
 */
export interface TotalVerificationResult {
  total: number;
  sumOfSubtotals: number;
  isCorrect: boolean;
}