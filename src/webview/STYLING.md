# Styling and Theming Guide

## Overview

The Infra Genie extension uses CSS Modules for component styling, ensuring proper encapsulation and maintainability. All styles respect VS Code's theme settings and automatically adapt to light/dark themes.

## Architecture

### CSS Modules

Each React component has its own CSS module file:

- `App.module.css` - Main app container styles
- `MainMenu.module.css` - Main menu and feature cards
- `UserInputForm.module.css` - Form inputs and validation
- `ChatInterface.module.css` - Chat layout and message container
- `MessageBubble.module.css` - Individual message styling
- `ErrorNotification.module.css` - Error notification banner
- `LoadingIndicator.module.css` - Loading spinner

### Global Styles

`global.css` contains:
- Base HTML/body styles
- Accessibility utilities (`.visually-hidden`, `.skip-link`)
- Focus management
- Responsive typography
- Print styles
- Reduced motion support
- High contrast mode support

## VS Code Theme Integration

All components use VS Code CSS variables for theming:

### Color Variables

```css
/* Foreground colors */
--vscode-foreground
--vscode-descriptionForeground
--vscode-errorForeground

/* Background colors */
--vscode-editor-background
--vscode-input-background
--vscode-button-background
--vscode-button-secondaryBackground

/* Border colors */
--vscode-panel-border
--vscode-input-border
--vscode-focusBorder

/* Interactive states */
--vscode-button-hoverBackground
--vscode-button-secondaryHoverBackground
--vscode-list-hoverBackground

/* Badges and notifications */
--vscode-badge-background
--vscode-badge-foreground
--vscode-inputValidation-errorBackground
--vscode-inputValidation-errorBorder
```

### Typography Variables

```css
--vscode-font-family
--vscode-editor-font-family
```

## Responsive Design

The UI adapts to different screen sizes with three breakpoints:

### Desktop (default)
- Full-width layouts
- Multi-column grids
- Larger padding and spacing

### Tablet (≤768px)
```css
@media (max-width: 768px) {
  /* Reduced padding */
  /* Single-column layouts */
  /* Smaller font sizes */
}
```

### Mobile (≤480px)
```css
@media (max-width: 480px) {
  /* Minimal padding */
  /* Stacked layouts */
  /* Touch-friendly buttons */
}
```

## Accessibility Features

### Focus Management
- All interactive elements have visible focus indicators
- Focus styles use `--vscode-focusBorder`
- 2px outline with 2px offset for clarity

### Screen Reader Support
- `.visually-hidden` class for screen-reader-only content
- Proper ARIA labels on all components
- Semantic HTML structure

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Disables animations */
  /* Removes transitions */
  /* Sets scroll-behavior to auto */
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  /* Increases border widths */
  /* Adds text decoration to links */
}
```

## Component Styling Patterns

### Using CSS Modules in Components

```tsx
import styles from './Component.module.css';

function Component() {
  return (
    <div className={styles.container}>
      <button className={styles.button}>Click me</button>
    </div>
  );
}
```

### Conditional Classes

```tsx
<div className={`${styles.card} ${isActive ? styles.active : styles.inactive}`}>
```

### Global Styles in Modules

For styling markdown content or other global elements:

```css
.messageContent :global(p) {
  margin: 0.5em 0;
}
```

## Best Practices

1. **Always use VS Code CSS variables** for colors and fonts
2. **Test in both light and dark themes** before committing
3. **Include responsive styles** for all new components
4. **Add focus styles** to all interactive elements
5. **Use semantic HTML** for better accessibility
6. **Keep specificity low** - avoid nested selectors when possible
7. **Document complex styles** with comments
8. **Test with keyboard navigation** and screen readers

## Testing Themes

To test the extension in different themes:

1. Open VS Code settings
2. Search for "Color Theme"
3. Try both light and dark themes
4. Verify all colors are readable
5. Check focus indicators are visible
6. Test responsive layouts at different sizes

## Maintenance

When adding new components:

1. Create a new `.module.css` file
2. Import it in the component
3. Use VS Code CSS variables
4. Add responsive breakpoints
5. Include accessibility features
6. Test in multiple themes
7. Update this documentation

## Common Issues

### Colors not updating with theme
- Ensure you're using `var(--vscode-*)` variables
- Check that the variable name is correct
- Verify the variable exists in VS Code's theme

### CSS modules not working
- Check that the file ends with `.module.css`
- Verify webpack config has CSS modules enabled
- Ensure the type declaration file exists

### Responsive styles not applying
- Check media query syntax
- Verify breakpoint values
- Test in browser dev tools with responsive mode

## Resources

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code Theme Colors](https://code.visualstudio.com/api/references/theme-color)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
