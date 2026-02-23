# AGRI-SYNC

## Current State

AGRI-SYNC is a live nature-inspired marketplace connecting farmers directly with buyers. The platform features:

- **Frontend**: React + TypeScript + Tailwind CSS with nature-inspired animations
- **User System**: Internet Identity authentication with farmer/buyer profiles
- **Product Management**: Farmers can list products ("plant seeds"), buyers can browse and purchase
- **Shopping Experience**: Cart system, order management, product discovery
- **Design**: Organic, warm interface with custom animations and living ecosystem feel
- **Current Language**: English only (all UI text, labels, buttons, messages hardcoded in English)

## Requested Changes (Diff)

### Add
- **Multi-language support (i18n)**: Hindi, English, and additional languages (Punjabi, Tamil, Telugu, Bengali)
- **Language switcher**: UI component in header/navigation to toggle between languages
- **Translation system**: i18n infrastructure with translation files for each language
- **Persistent language preference**: Store user's language choice in localStorage

### Modify
- All hardcoded English text throughout the app to use translation keys
- Navigation, buttons, labels, forms, messages, and page content to be translatable

### Remove
- Hardcoded English strings (will be replaced with translation keys)

## Implementation Plan

1. **Set up i18n infrastructure**:
   - Install and configure i18next with React bindings
   - Create translation JSON files for Hindi, English, Punjabi, Tamil, Telugu, Bengali
   - Set up language detection and persistence

2. **Create language switcher component**:
   - Dropdown or toggle UI in the main navigation/header
   - Display language names in their native script (हिंदी, English, ਪੰਜਾਬੀ, தமிழ், తెలుగు, বাংলা)
   - Update on selection and persist choice

3. **Translate all UI text**:
   - Extract all hardcoded strings from components
   - Replace with translation keys
   - Provide comprehensive translations for all supported languages

4. **Test and validate**:
   - Ensure language switching works across all pages
   - Verify text layout and styling with different scripts
   - Validate TypeScript and build

## UX Notes

- Language switcher should be easily accessible from any page (likely in top navigation near profile)
- Default to English for first-time users, then respect user's selection
- Ensure Hindi and Indic script fonts render properly
- Keep the warm, organic design language intact across all translations
- Consider cultural context in translations (farming terminology may vary by region)
