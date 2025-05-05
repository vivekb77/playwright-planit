import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ContactPage } from '../../pages/ContactPage';
import { logger } from '../../utils/logger';

test.describe('Contact Page Tests', () => {
  let homePage: HomePage;
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    logger.info('Setting up test');
    homePage = new HomePage(page);
    contactPage = new ContactPage(page);
    
    // Navigate to home page
    await homePage.navigateToHome();
  });

  /**
   * Test Case 1:
   * 1. From the home page go to contact page
   * 2. Click submit button
   * 3. Verify error messages
   * 4. Populate mandatory fields
   * 5. Validate errors are gone
   */
  test('should show validation errors and clear them when fields are populated', async ({ page }) => {
    logger.info('Starting Test Case 1');
    
    // 1. From the home page go to contact page
    logger.info('Step 1: Navigate to contact page');
    await homePage.navigateToContact();
    
    // 2. Click submit button
    logger.info('Step 2: Click submit button');
    await contactPage.submitForm();
    
    // Wait for any validation to appear
    await page.waitForTimeout(1000);
    
    // 3. Verify error messages are present
    logger.info('Step 3: Verify error messages');
    
    // Get all form validation errors
    const errors = await page.locator('.help-inline:visible').allTextContents();
    
    // Log what we found
    logger.info(`Found ${errors.length} error messages: ${errors.join(', ')}`);
    
    // Check for the expected validation error messages
    expect(errors).toContain('Forename is required');
    expect(errors).toContain('Email is required');
    expect(errors).toContain('Message is required');
    
    // 4. Populate mandatory fields
    logger.info('Step 4: Populate mandatory fields');
    await contactPage.fillContactForm(
      'Test User', // forename
      'Test', // surname
      'test@example.com', // email
      '1234567890', // telephone
      'This is a test message' // message
    );
    
    // Verify field values have been set
    expect(await page.inputValue('#forename')).toBe('Test User');
    expect(await page.inputValue('#email')).toBe('test@example.com');
    expect(await page.inputValue('#message')).toBe('This is a test message');
    
    // 5. Validate errors are gone - check that the error containers are no longer visible
    logger.info('Step 5: Validate errors are gone');
    
    // Wait briefly for validation UI to update
    await page.waitForTimeout(1000);
    
    // Check for error elements now - should be none or empty
    const remainingErrors = await page.locator('.help-inline:visible').allTextContents();
    logger.info(`Remaining errors after filling form: ${remainingErrors.length > 0 ? remainingErrors.join(', ') : 'None'}`);
    
    // Expect no "required" errors
    expect(remainingErrors).not.toContain('Forename is required');
    expect(remainingErrors).not.toContain('Email is required');
    expect(remainingErrors).not.toContain('Message is required');
    
    logger.info('Test Case 1 completed successfully');
  });
  
  /**
   * Test Case 2:
   * 1. From the home page go to contact page
   * 2. Populate mandatory fields
   * 3. Click submit button
   * 4. Validate successful submission message
   * Note: Run this test 5 times to ensure 100% pass rate
   */
  for (let i = 0; i < 5; i++) {
    test(`should submit contact form successfully (run ${i + 1})`, async ({ page }) => {
      logger.info(`Starting Test Case 2 (run ${i + 1})`);
      
      // 1. From the home page go to contact page
      logger.info('Step 1: Navigate to contact page');
      await homePage.navigateToContact();
      
      // 2. Populate mandatory fields
      logger.info('Step 2: Populate mandatory fields');
      await contactPage.fillContactForm(
        `Test User ${i}`, // forename
        `Test ${i}`, // surname
        `test${i}@example.com`, // email
        `123456789${i}`, // telephone
        `This is test message ${i}` // message
      );
      
      // 3. Click submit button
      logger.info('Step 3: Click submit button');
      await contactPage.submitForm();
      
      // 4. Validate successful submission message
      logger.info('Step 4: Validate successful submission message');
      
      // Wait for success message to appear - it might take some time
      await page.waitForTimeout(2000);
      
      // Check for success alert
      const successMessageVisible = await page.isVisible('.alert-success');
      expect(successMessageVisible).toBeTruthy();
      
      // Get the success message text
      const successMessage = await page.textContent('.alert-success');
      logger.info(`Success message: ${successMessage}`);
      
      // Verify success message content
      expect(successMessage).toBeTruthy();
      expect(successMessage).toContain('Thanks');
      
      logger.info(`Test Case 2 (run ${i + 1}) completed successfully`);
    });
  }
});