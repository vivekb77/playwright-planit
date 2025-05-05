import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * Page object for the Cart page
 */
export class CartPage extends BasePage {
  // Cart table selectors - multiple options for flexibility
  private readonly cartTableSelectors = [
    '.cart-items',
    'table.cart',
    'table.table',
    '.cart-contents'
  ];
  
  private readonly cartRowSelectors = [
    '.cart-item',
    'tr',
    'tbody tr',
    '.item'
  ];
  
  private readonly productNameSelectors = [
    '.product-title',
    'td:first-child',
    '.item-name',
    '.name'
  ];
  
  private readonly productPriceSelectors = [
    '.product-price',
    'td:nth-child(2)',
    '.price',
    '.item-price'
  ];
  
  private readonly productQuantitySelectors = [
    'input.input-mini',
    'input[type="number"]',
    '.quantity input',
    'td:nth-child(3) input'
  ];
  
  private readonly productSubtotalSelectors = [
    '.line-price',
    'td:last-child',
    '.subtotal',
    '.item-total'
  ];
  
  private readonly totalPriceSelectors = [
    '.total',
    'tfoot .total',
    'tfoot td:last-child',
    '.cart-total'
  ];
  
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
    
    // Wait for cart page to load with flexible selectors
    await this.waitForCartPage();
  }
  
  /**
   * Wait for cart page to load with flexible selectors
   */
  private async waitForCartPage(): Promise<void> {
    logger.info('Waiting for cart page to load');
    
    for (const selector of this.cartTableSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        logger.info(`Cart page loaded, found: ${selector}`);
        return;
      } catch (error) {
        logger.info(`Selector not found: ${selector}`);
      }
    }
    
    logger.warn('None of the expected cart page selectors found, continuing anyway');
  }

  /**
   * Get all cart items
   * @returns Promise resolving to array of cart items with their details
   */
  async getCartItems(): Promise<CartItem[]> {
    logger.info('Getting all cart items');
    
    // First find which row selector works
    let rowSelector = this.cartRowSelectors[0];
    let rowCount = 0;
    
    for (const selector of this.cartRowSelectors) {
      try {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          rowSelector = selector;
          rowCount = count;
          logger.info(`Found ${count} cart items with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Try next selector
      }
    }
    
    if (rowCount === 0) {
      logger.error('No cart items found with any selector');
      return [];
    }
    
    // Function to try getting content with multiple selectors
    const getTextWithSelectors = async (parent: any, selectors: string[]): Promise<string> => {
      for (const selector of selectors) {
        try {
          const element = parent.locator(selector);
          if (await element.count() > 0) {
            const text = await element.textContent();
            return text || '';
          }
        } catch (error) {
          // Try next selector
        }
      }
      return '';
    };
    
    // Function to try getting input value with multiple selectors
    const getInputValueWithSelectors = async (parent: any, selectors: string[]): Promise<string> => {
      for (const selector of selectors) {
        try {
          const element = parent.locator(selector);
          if (await element.count() > 0) {
            const value = await element.inputValue();
            return value || '0';
          }
        } catch (error) {
          // Try next selector
        }
      }
      return '0';
    };
    
    const cartRows = this.page.locator(rowSelector);
    const items: CartItem[] = [];
    
    for (let i = 0; i < rowCount; i++) {
      try {
        const row = cartRows.nth(i);
        
        const name = await getTextWithSelectors(row, this.productNameSelectors);
        const priceText = await getTextWithSelectors(row, this.productPriceSelectors);
        const quantityText = await getInputValueWithSelectors(row, this.productQuantitySelectors);
        const subtotalText = await getTextWithSelectors(row, this.productSubtotalSelectors);
        
        // Parse numeric values
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '') || '0');
        const quantity = parseInt(quantityText || '0', 10);
        const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, '') || '0');
        
        if (name || price > 0 || quantity > 0) {
          items.push({
            name: name.trim(),
            price,
            quantity,
            subtotal
          });
          
          logger.info(`Cart item ${i+1}: ${name.trim()}, Price: $${price}, Quantity: ${quantity}, Subtotal: $${subtotal}`);
        }
      } catch (error) {
        logger.error(`Error processing cart item ${i+1}: ${error}`);
      }
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
    
    // Try each selector for total price
    for (const selector of this.totalPriceSelectors) {
      try {
        const totalElement = this.page.locator(selector);
        if (await totalElement.count() > 0) {
          const totalText = await totalElement.textContent();
          if (totalText) {
            const total = parseFloat(totalText.replace(/[^0-9.]/g, '') || '0');
            logger.info(`Total price (${selector}): $${total}`);
            return total;
          }
        }
      } catch (error) {
        // Try next selector
      }
    }
    
    logger.error('Total price not found with any selector');
    return 0;
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
      
      if (isCorrect) {
        logger.info(`Subtotal verification passed for ${item.name}`);
      } else {
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
    
    if (isCorrect) {
      logger.info(`Total verification passed: $${total} equals sum of subtotals $${sumOfSubtotals}`);
    } else {
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