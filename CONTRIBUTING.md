# Contributing to Currency Exchange App

Thank you for your interest in contributing to the Currency Exchange App! This document provides guidelines for contributing to this project.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if possible**
- **Include your environment details** (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the behavior you expected**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Add tests if applicable
5. Ensure the test suite passes (`npm test`)
6. Make sure your code follows the existing code style
7. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
8. Push to the branch (`git push origin feature/AmazingFeature`)
9. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow the existing code formatting (Prettier configuration)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for good test coverage
- Test on multiple browsers when possible

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling
└── tests/              # Test files
```

## Areas for Contribution

We especially welcome contributions in these areas:

1. **New Currency Support**: Adding support for additional currencies
2. **UI/UX Improvements**: Better animations, accessibility, mobile experience
3. **Performance Optimizations**: Reducing bundle size, improving load times
4. **Testing**: Unit tests, integration tests, E2E tests
5. **Documentation**: API docs, user guides, code comments
6. **Internationalization**: Support for multiple languages
7. **Accessibility**: Screen reader support, keyboard navigation
8. **New Features**: Rate alerts, currency trend analysis, etc.

## Setting Up Development Environment

1. **Prerequisites**:
   - Node.js 18+
   - npm or yarn
   - Git

2. **Setup**:
   ```bash
   git clone https://github.com/yourusername/currency-exchange-app.git
   cd currency-exchange-app
   npm install
   npm run dev
   ```

3. **Available Scripts**:
   - `npm run dev` - Start development server
   - `npm run build` - Build for production
   - `npm run preview` - Preview production build
   - `npm test` - Run tests
   - `npm run lint` - Run ESLint

## Questions?

Feel free to contact the project maintainers if you have any questions about contributing.

Thank you for contributing! 🎉