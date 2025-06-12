// Comprehensive barrel export for all UI components
// This provides a centralized entry point for importing UI components

// ===============================================
// CORE UI COMPONENTS (from ResponsiveComponents.tsx)
// ===============================================
export {
  ResponsiveCard,
  ResponsiveGrid,
  ResponsiveModal,
  ResponsiveTable,
  Button,
  Input,
  Select,
  FormField
} from './ResponsiveComponents';

// ===============================================
// STANDALONE COMPONENTS (default exports)
// ===============================================
export { default as ResponsiveGridStandalone } from './ResponsiveGrid';
export { default as ResponsiveModalStandalone } from './ResponsiveModal';
export { default as ResponsiveTableStandalone } from './ResponsiveTable';

// ===============================================
// FORM COMPONENTS (from ResponsiveForm.tsx)
// ===============================================
// Note: These are alternative implementations of form components
// Use these if you need specific form-focused functionality
export {
  FormField as FormFieldAlt,
  Input as InputAlt,
  Select as SelectAlt,
  Button as ButtonAlt
} from './ResponsiveForm';

// ===============================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// ===============================================
// Main exports that should be used in most cases
export {
  ResponsiveCard as Card,
  ResponsiveGrid as Grid,
  ResponsiveModal as Modal,
  ResponsiveTable as Table
} from './ResponsiveComponents';

// ===============================================
// TYPE EXPORTS
// ===============================================
// Note: Types are defined as interfaces within component files
// They can be imported directly from this barrel export if needed