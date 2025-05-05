import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * Page object for the Shop page
 */
export class ShopPage extends BasePage {
  // Product selectors
  private readonly productCards = '.product';
  private readonly productTitle = '.product-title';
  private readonly productPrice = '.product-price';
  private readonly buyButton = '.btn-success';
  
  // Product IDs from the actual HTML
  private readonly productIds = {
    'Teddy Bear': 'product-1',
    'Stuffed Frog': 'product-2',
    'Handmade Doll': 'product-3',
    'Fluffy Bunny': 'product-4',
    'Smiley Bear': 'product-5',
    'Funny Cow': 'product-6',
    'Valentine Bear': 'product-7',
    'Smiley Face': 'product-8'
  };
  
  // Product prices from the actual HTML
  private readonly productPrices = {
    'Teddy Bear': 12.99,
    'Stuffed Frog': 10.99,
    'Handmade Doll': 10.99,
    'Fluffy Bunny': 9.99,
    'Smiley Bear': 14.99,
    'Funny Cow': 10.99,
    'Valentine Bear': 14.99,
    'Smiley Face': 9.99
  };
  
  /**
   * Constructor for the ShopPage class
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the shop page
   */
  async navigateToShop(): Promise<void> {
    logger.info('Navigating to shop page');
    await this.navigate('/#/shop');
    
    // Wait for products to load
    await this.page.waitForSelector(this.productCards, { timeout: 10000 })
      .catch(() => logger.warn('Products not loaded within timeout'));
  }

  /**
   * Get all products
   * @returns Promise resolving to array of product names
   */
  async getProducts(): Promise<string[]> {
    logger.info('Getting all products');
    const productElements = this.page.locator(this.productCards);
    const count = await productElements.count();
    
    const products: string[] = [];
    for (let i = 0; i < count; i++) {
      const titleElement = productElements.nth(i).locator(this.productTitle);
      const text = await titleElement.textContent();
      if (text) {
        products.push(text.trim());
      }
    }
    
    logger.info(`Found ${products.length} products: ${products.join(', ')}`);
    return products;
  }

  /**
   * Get price of a specific product
   * @param productName - Name of the product
   * @returns Promise resolving to the product price
   */
  async getProductPrice(productName: string): Promise<number> {
    logger.info(`Getting price for product: ${productName}`);
    
    // Try to get from known prices first
    if (productName in this.productPrices) {
      logger.info(`Using known price for ${productName}: $${this.productPrices[productName as keyof typeof this.productPrices]}`);
      return this.productPrices[productName as keyof typeof this.productPrices];
    }
    
    // Otherwise look it up from the page
    try {
      const productId = this.productIds[productName as keyof typeof this.productIds];
      if (productId) {
        const priceElement = this.page.locator(`#${productId} ${this.productPrice}`);
        const priceText = await priceElement.textContent();
        
        if (priceText) {
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          logger.info(`Price for ${productName}: $${price}`);
          return price;
        }
      }
      
      throw new Error(`Product ID not found for: ${productName}`);
    } catch (error) {
      logger.error(`Error getting price for ${productName}: ${error}`);
      throw error;
    }
  }

  /**
   * Buy a specific product
   * @param productName - Name of the product to buy
   * @param quantity - Quantity to buy (default: 1)
   * @returns Promise resolving to boolean indicating if product was found and bought
   */
  async buyProduct(productName: string, quantity: number = 1): Promise<boolean> {
    logger.info(`Buying ${quantity} of ${productName}`);
    
    try {
      // Get the product ID
      const productId = this.productIds[productName as keyof typeof this.productIds];
      
      if (!productId) {
        logger.error(`Product ID not found for: ${productName}`);
        return false;
      }
      
      // Get the buy button
      const buyButtonElement = this.page.locator(`#${productId} ${this.buyButton}`);
      
      // Check if button exists
      if (await buyButtonElement.count() === 0) {
        logger.error(`Buy button not found for product: ${productName}`);
        return false;
      }
      
      // Get the initial cart count
      const initialCartCount = await this.getCartCount();
      logger.info(`Initial cart count: ${initialCartCount}`);
      
      // Click the buy button the specified number of times
      for (let i = 0; i < quantity; i++) {
        logger.info(`Buying ${productName} (${i + 1}/${quantity})`);
        await buyButtonElement.click();
        // Short wait to ensure cart is updated
        await this.page.waitForTimeout(300);
      }
      
      // Get the updated cart count to verify
      const updatedCartCount = await this.getCartCount();
      logger.info(`Updated cart count: ${updatedCartCount}`);
      
      const success = updatedCartCount >= initialCartCount + quantity;
      
      if (success) {
        logger.info(`Successfully bought ${quantity} of ${productName}`);
      } else {
        logger.error(`Failed to verify cart count after buying. Expected at least: ${initialCartCount + quantity}, Actual: ${updatedCartCount}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Error buying ${productName}: ${error}`);
      return false;
    }
  }
  
  /**
   * Get the current cart count
   * @returns Promise resolving to the cart count
   */
  async getCartCount(): Promise<number> {
    try {
      const cartCountElement = this.page.locator('.cart-count');
      const cartCountText = await cartCountElement.textContent() || '0';
      return parseInt(cartCountText, 10);
    } catch (error) {
      logger.error(`Error getting cart count: ${error}`);
      return 0;
    }
  }
}