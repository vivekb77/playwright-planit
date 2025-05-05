## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test cases:
```bash
# Run contact page tests (Test Case 1 & 2)
npm run test:contact

# Run shopping cart tests (Test Case 3)
npm run test:shopping
```

### Run tests in headed mode (with browser visible):
```bash
npm run test -- --headed
```

### Generate and view HTML report:
```bash
npm run report
```

## CI/CD Integration

### Jenkins

This project includes a Jenkinsfile that defines a pipeline with the following stages:
- Setup: Install dependencies and Playwright browsers
- Lint: Check code formatting
- Test: Run the tests and publish results
- Post-actions: Archive artifacts and clean workspace

To use with Jenkins:
1. Create a new Pipeline job in Jenkins
2. Configure it to use the Jenkinsfile from the repository
3. Run the pipeline

### GitHub Actions

A GitHub Actions workflow is included in `.github/workflows/playwright.yml`. It will:
- Run on push to main/master branches
- Run on pull requests to main/master branches
- Run daily at midnight UTC
- Install dependencies and run tests
- Upload test results as artifacts