import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * Page object for the Contact page
 */
export class ContactPage extends BasePage {
  // Form field selectors
  private readonly forenameInput = '#forename';
  private readonly surnameInput = '#surname';
  private readonly emailInput = '#email';
  private readonly telephoneInput = '#telephone';
  private readonly messageTextarea = '#message';
  private readonly submitButton = '.btn-contact';
  
  // Error message selectors - updated based on actual HTML structure
  private readonly forenameError = '#forename-err';
  private readonly emailError = '#email-err';
  private readonly messageError = '#message-err';

  
  // Success message selector
  private readonly successMessage = '.alert-success';


  /**
   * Constructor for the ContactPage class
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the contact page
   */
  async navigateToContact(): Promise<void> {
    logger.info('Navigating to contact page');
    await this.navigate('/#/contact');
  }

  /**
   * Fill the contact form
   * @param forename - Forename value
   * @param surname - Surname value
   * @param email - Email value
   * @param telephone - Telephone value
   * @param message - Message value
   */
  async fillContactForm(
    forename: string = '',
    surname: string = '',
    email: string = '',
    telephone: string = '',
    message: string = ''
  ): Promise<void> {
    logger.info('Filling contact form');
    
    if (forename) {
      await this.fill(this.forenameInput, forename);
    }
    
    if (surname) {
      await this.fill(this.surnameInput, surname);
    }
    
    if (email) {
      await this.fill(this.emailInput, email);
    }
    
    if (telephone) {
      await this.fill(this.telephoneInput, telephone);
    }
    
    if (message) {
      await this.fill(this.messageTextarea, message);
    }
  }

  /**
   * Submit the contact form
   */
  async submitForm(): Promise<void> {
    logger.info('Submitting contact form');
    await this.click(this.submitButton);
    
    // Wait for potential page update after submission
    await this.page.waitForTimeout(500);
  }

  /**
   * Get all validation error messages
   * @returns Promise resolving to array of error messages
   */
  async getValidationErrors(): Promise<string[]> {
    logger.info('Getting validation error messages');
    
    // Wait for validation errors to appear
    await this.page.waitForTimeout(500);
    
    // Check if we need to create error selectors dynamically
    // For example, if errors appear in a different way after form submission
    await this.page.waitForSelector('.control-group.error', { state: 'attached', timeout: 3000 }).catch(() => {
      logger.info('No error control groups found');
    });
    
    const errorElements = this.page.locator('.help-inline:visible, .alert-error:visible');
    const count = await errorElements.count();
    
    logger.info(`Found ${count} error elements`);
    
    const errors: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent();
      if (text && text.trim()) {
        errors.push(text.trim());
        logger.info(`Error ${i+1}: ${text.trim()}`);
      }
    }
    
    return errors;
  }

  /**
   * Check if forename error is displayed
   * @returns Promise resolving to boolean indicating if error is displayed
   */
  async isForenameErrorDisplayed(): Promise<boolean> {
    // Look for error message in multiple possible locations
    const errorSelectors = [
      this.forenameError,
      `${this.forenameInput} + .help-inline`,
      `label[for="forename"] + .help-inline`,
      `.control-group:has(${this.forenameInput}) .help-inline`
    ];
    
    for (const selector of errorSelectors) {
      try {
        const isVisible = await this.page.isVisible(selector);
        if (isVisible) {
          logger.info(`Forename error displayed at selector: ${selector}`);
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Try one more approach - find any visible error in the forename control group
    try {
      const controlGroup = this.page.locator('.control-group', { has: this.page.locator(this.forenameInput) });
      const hasError = await controlGroup.evaluate(el => el.classList.contains('error'));
      if (hasError) {
        const errorText = await controlGroup.locator('.help-inline').isVisible();
        if (errorText) {
          logger.info('Forename error displayed in control group');
          return true;
        }
      }
    } catch (error) {
      // Ignore errors in this approach
    }
    
    logger.info('Forename error not displayed');
    return false;
  }

  /**
   * Check if email error is displayed
   * @returns Promise resolving to boolean indicating if error is displayed
   */
  async isEmailErrorDisplayed(): Promise<boolean> {
    // Look for error message in multiple possible locations
    const errorSelectors = [
      this.emailError,
      `${this.emailInput} + .help-inline`,
      `label[for="email"] + .help-inline`,
      `#email-group .help-inline`
    ];
    
    for (const selector of errorSelectors) {
      try {
        const isVisible = await this.page.isVisible(selector);
        if (isVisible) {
          logger.info(`Email error displayed at selector: ${selector}`);
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Try one more approach - find any visible error in the email control group
    try {
      const controlGroup = this.page.locator('.control-group', { has: this.page.locator(this.emailInput) });
      const hasError = await controlGroup.evaluate(el => el.classList.contains('error'));
      if (hasError) {
        const errorText = await controlGroup.locator('.help-inline').isVisible();
        if (errorText) {
          logger.info('Email error displayed in control group');
          return true;
        }
      }
    } catch (error) {
      // Ignore errors in this approach
    }
    
    logger.info('Email error not displayed');
    return false;
  }

  /**
   * Check if message error is displayed
   * @returns Promise resolving to boolean indicating if error is displayed
   */
  async isMessageErrorDisplayed(): Promise<boolean> {
    // Look for error message in multiple possible locations
    const errorSelectors = [
      this.messageError,
      `${this.messageTextarea} + .help-inline`,
      `label[for="message"] + .help-inline`,
      `#message-group .help-inline`
    ];
    
    for (const selector of errorSelectors) {
      try {
        const isVisible = await this.page.isVisible(selector);
        if (isVisible) {
          logger.info(`Message error displayed at selector: ${selector}`);
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Try one more approach - find any visible error in the message control group
    try {
      const controlGroup = this.page.locator('.control-group', { has: this.page.locator(this.messageTextarea) });
      const hasError = await controlGroup.evaluate(el => el.classList.contains('error'));
      if (hasError) {
        const errorText = await controlGroup.locator('.help-inline').isVisible();
        if (errorText) {
          logger.info('Message error displayed in control group');
          return true;
        }
      }
    } catch (error) {
      // Ignore errors in this approach
    }
    
    logger.info('Message error not displayed');
    return false;
  }

  /**
   * Get success message
   * @returns Promise resolving to the success message text or null
   */
  async getSuccessMessage(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.successMessage, { state: 'visible', timeout: 5000 });
      const message = await this.getText(this.successMessage);
      logger.info(`Success message: ${message}`);
      return message;
    } catch (error) {
      logger.info('Success message not found');
      return null;
    }
  }

  /**
   * Check if success message is displayed
   * @returns Promise resolving to boolean indicating if success message is displayed
   */
  async isSuccessMessageDisplayed(): Promise<boolean> {
    const isVisible = await this.page.isVisible(this.successMessage);
    logger.info(`Success message displayed: ${isVisible}`);
    return isVisible;
  }
}