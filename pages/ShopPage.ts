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
    await this.page.waitForSelector(this.productCards);
  }

  /**
   * Get all products
   * @returns Promise resolving to array of product info
   */
  async getProducts(): Promise<ProductInfo[]> {
    logger.info('Getting all products');
    const productElements = this.page.locator(this.productCards);
    const count = await productElements.count();
    
    const products: ProductInfo[] = [];
    for (let i = 0; i < count; i++) {
      const productCard = productElements.nth(i);
      const titleElement = productCard.locator(this.productTitle);
      const priceElement = productCard.locator(this.productPrice);
      
      const name = await titleElement.textContent() || '';
      const priceText = await priceElement.textContent() || '';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      
      products.push({
        name: name.trim(),
        price,
        index: i
      });
      
      logger.info(`Found product: ${name.trim()} - $${price}`);
    }
    
    return products;
  }

  /**
   * Find a product by partial name match
   * @param partialName - Partial name to match
   * @returns Promise resolving to the product info or null if not found
   */
  async findProduct(partialName: string): Promise<ProductInfo | null> {
    logger.info(`Looking for product containing: ${partialName}`);
    
    const products = await this.getProducts();
    const product = products.find(p => p.name.includes(partialName));
    
    if (product) {
      logger.info(`Found product: ${product.name} - $${product.price}`);
      return product;
    } else {
      logger.error(`Product containing "${partialName}" not found`);
      logger.info(`Available products: ${products.map(p => p.name).join(', ')}`);
      return null;
    }
  }

  /**
   * Get price of a specific product
   * @param partialName - Partial name of the product
   * @returns Promise resolving to the product price
   */
  async getProductPrice(partialName: string): Promise<number> {
    logger.info(`Getting price for product containing: ${partialName}`);
    
    const product = await this.findProduct(partialName);
    
    if (!product) {
      const errorMsg = `Product containing "${partialName}" not found`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    logger.info(`Price for ${product.name}: $${product.price}`);
    return product.price;
  }

  /**
   * Buy a specific product
   * @param partialName - Partial name of the product to buy
   * @param quantity - Quantity to buy (default: 1)
   * @returns Promise resolving to boolean indicating if product was found and bought
   */
  async buyProduct(partialName: string, quantity: number = 1): Promise<boolean> {
    logger.info(`Buying ${quantity} of product containing: ${partialName}`);
    
    const product = await this.findProduct(partialName);
    
    if (!product) {
      logger.error(`Product containing "${partialName}" not found, cannot buy`);
      return false;
    }
    
    // Get the product card and buy button
    const productCard = this.page.locator(this.productCards).nth(product.index);
    const buyButtonElement = productCard.locator(this.buyButton);
    
    // Check if button exists
    if (await buyButtonElement.count() === 0) {
      logger.error(`Buy button not found for product: ${product.name}`);
      return false;
    }
    
    // Get the initial cart count
    const initialCartCount = await this.getCartCount();
    logger.info(`Initial cart count: ${initialCartCount}`);
    
    // Click the buy button the specified number of times
    for (let i = 0; i < quantity; i++) {
      logger.info(`Buying ${product.name} (${i + 1}/${quantity})`);
      await buyButtonElement.click();
      // Short wait to ensure cart is updated
      await this.page.waitForTimeout(300);
    }
    
    // Get the updated cart count to verify
    const updatedCartCount = await this.getCartCount();
    logger.info(`Updated cart count: ${updatedCartCount}`);
    
    const expectedCount = initialCartCount + quantity;
    const success = updatedCartCount === expectedCount;
    
    if (success) {
      logger.info(`Successfully bought ${quantity} of ${product.name}`);
    } else {
      logger.error(`Failed to verify cart count after buying. Expected: ${expectedCount}, Actual: ${updatedCartCount}`);
    }
    
    return success;
  }
  
  /**
   * Get the current cart count
   * @returns Promise resolving to the cart count
   */
  private async getCartCount(): Promise<number> {
    const cartCountElement = this.page.locator('.cart-count');
    const cartCountText = await cartCountElement.textContent() || '0';
    return parseInt(cartCountText, 10);
  }
}

/**
 * Interface for product information
 */
export interface ProductInfo {
  name: string;
  price: number;
  index: number;
}