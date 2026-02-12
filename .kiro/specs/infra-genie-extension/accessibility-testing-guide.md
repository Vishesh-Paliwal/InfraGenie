# Accessibility Testing Guide for Infra Genie Extension

This guide provides instructions for manually testing the accessibility features implemented in the Infra Genie VS Code extension.

## Overview

The extension has been enhanced with the following accessibility features:
- ARIA labels on all interactive elements
- Keyboard navigation support for all controls
- Focus management for form fields
- Screen reader compatibility
- Semantic HTML structure
- Visual focus indicators

## Testing Checklist

### 1. Keyboard Navigation Testing

#### Main Menu
- [ ] Press Tab to navigate between feature cards
- [ ] Press Enter or Space on "Spec" card to activate
- [ ] Verify unavailable cards cannot be activated with keyboard
- [ ] Verify focus indicator is visible on each card

#### User Input Form
- [ ] Tab through all form fields in logical order
- [ ] Verify each field receives visible focus indicator
- [ ] Use arrow keys to navigate select dropdowns
- [ ] Use arrow keys to navigate radio buttons
- [ ] Press Enter to submit form
- [ ] Verify focus moves to first error field when validation fails
- [ ] Verify all required field indicators are announced

#### Chat Interface
- [ ] Tab to message input textarea
- [ ] Type message and press Enter to send
- [ ] Verify Shift+Enter creates new line
- [ ] Tab to Send button and press Enter/Space
- [ ] Tab to New Session button and activate
- [ ] Verify focus returns to textarea after sending message

#### Message Bubbles
- [ ] Tab to Copy button on message hover
- [ ] Press Enter/Space to copy message
- [ ] For PRD messages, tab through Copy and Save buttons
- [ ] Verify all buttons are keyboard accessible

### 2. Screen Reader Testing

#### Recommended Screen Readers
- **macOS**: VoiceOver (Cmd+F5 to enable)
- **Windows**: NVDA (free) or JAWS
- **Linux**: Orca

#### Main Menu Testing
- [ ] Verify screen reader announces "Infra Genie" heading
- [ ] Verify each feature card announces title and description
- [ ] Verify unavailable cards announce "Coming Soon"
- [ ] Verify navigation landmark is announced

#### User Input Form Testing
- [ ] Verify form title is announced
- [ ] Verify each label is read before field
- [ ] Verify required fields announce "required"
- [ ] Verify error messages are announced immediately
- [ ] Verify help text for regions field is read
- [ ] Verify radio group is announced as a group
- [ ] Verify submit button purpose is clear

#### Chat Interface Testing
- [ ] Verify "Spec Chat" heading is announced
- [ ] Verify "Chat messages" region is announced
- [ ] Verify each message role (user/assistant) is announced
- [ ] Verify message timestamps are announced
- [ ] Verify loading indicator announces "Thinking..."
- [ ] Verify empty state message is announced
- [ ] Verify message input label is announced
- [ ] Verify keyboard hint is available

#### Error Notifications
- [ ] Verify error messages are announced immediately (assertive)
- [ ] Verify retry and dismiss buttons are announced
- [ ] Verify error icon is hidden from screen reader

### 3. Focus Management Testing

#### Form Validation
- [ ] Submit empty form
- [ ] Verify focus moves to first error field
- [ ] Correct first error and submit again
- [ ] Verify focus moves to next error field

#### Chat Interface
- [ ] Open chat interface
- [ ] Verify focus is on message input
- [ ] Send a message
- [ ] Verify focus returns to message input
- [ ] Click New Session
- [ ] Verify appropriate focus after session clear

### 4. ARIA Attributes Testing

Use browser developer tools to verify ARIA attributes:

#### Required ARIA Attributes
- [ ] All interactive elements have `role` attribute
- [ ] All buttons have `aria-label` or visible text
- [ ] All form fields have `aria-required` when required
- [ ] Error fields have `aria-invalid="true"`
- [ ] Error messages have `role="alert"`
- [ ] Loading indicators have `role="status"`
- [ ] Chat messages container has `role="log"`
- [ ] Feature cards have `aria-disabled` when unavailable

#### ARIA Relationships
- [ ] Form fields use `aria-describedby` for errors
- [ ] Form fields use `aria-describedby` for help text
- [ ] Chat interface uses `aria-labelledby` for title
- [ ] Message input uses `aria-describedby` for hint

### 5. Visual Focus Indicators

- [ ] All interactive elements show visible focus outline
- [ ] Focus outline uses VS Code theme colors
- [ ] Focus outline has sufficient contrast (3:1 minimum)
- [ ] Focus outline is not obscured by other elements
- [ ] Focus outline is visible in both light and dark themes

### 6. Semantic HTML Testing

Verify proper HTML structure using browser developer tools:

- [ ] Headings are in logical order (h1, h2, h3)
- [ ] Form uses proper `<form>` element
- [ ] Form fields use `<label>` elements
- [ ] Radio buttons use `<fieldset>` and `<legend>`
- [ ] Navigation uses `<nav>` element
- [ ] Main content uses `<main>` or `role="main"`
- [ ] Header uses `<header>` element
- [ ] Buttons use `<button>` element (not divs)

### 7. Color Contrast Testing

Use browser extensions or online tools to verify:

- [ ] Text has minimum 4.5:1 contrast ratio
- [ ] Large text has minimum 3:1 contrast ratio
- [ ] Focus indicators have minimum 3:1 contrast ratio
- [ ] Error messages have sufficient contrast
- [ ] Disabled elements are distinguishable

### 8. Responsive Design Testing

- [ ] Test at different zoom levels (100%, 150%, 200%)
- [ ] Verify text doesn't overflow containers
- [ ] Verify focus indicators remain visible when zoomed
- [ ] Verify all interactive elements remain accessible

## Common Issues to Watch For

### Keyboard Navigation
- Focus trap in modals or dialogs
- Invisible focus indicators
- Illogical tab order
- Missing keyboard shortcuts for common actions

### Screen Reader
- Unlabeled form fields
- Missing error announcements
- Redundant or verbose announcements
- Missing landmark regions

### Focus Management
- Focus lost after interactions
- Focus not moved to errors
- Focus not returned after dialogs close

## Testing Tools

### Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Includes accessibility audit
- **Color Contrast Analyzer**: Check color contrast ratios

### VS Code Extensions
- **webhint**: Linting for accessibility issues
- **axe Accessibility Linter**: Real-time accessibility checks

## Reporting Issues

When reporting accessibility issues, include:
1. Component/screen where issue occurs
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Assistive technology used (if applicable)
6. Browser and OS version

## Success Criteria

The extension meets accessibility requirements when:
- All interactive elements are keyboard accessible
- All content is screen reader accessible
- Focus management works correctly
- ARIA attributes are properly implemented
- Visual focus indicators are visible
- Color contrast meets WCAG AA standards
- Semantic HTML is used throughout

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [VS Code Accessibility Guidelines](https://code.visualstudio.com/docs/editor/accessibility)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
