# Multi-Language Support in AGRI-SYNC

This project supports 6 languages with full internationalization (i18n) using **react-i18next**.

## Supported Languages

1. **English** (en) - English
2. **Hindi** (hi) - हिंदी
3. **Punjabi** (pa) - ਪੰਜਾਬੀ
4. **Tamil** (ta) - தமிழ்
5. **Telugu** (te) - తెలుగు
6. **Bengali** (bn) - বাংলা

## Features

- **Auto-detection**: Automatically detects browser language on first visit
- **Persistence**: Language preference saved to localStorage
- **Dynamic switching**: Change language on-the-fly without page reload
- **Font support**: Includes Noto Sans font families for all Indic scripts
- **Culturally appropriate**: Translations include farming terminology adapted to each language

## Usage in Components

Import the translation hook:

\`\`\`typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  );
}
\`\`\`

## Translation Files

Located in `/src/i18n/locales/`:
- `en.json` - English
- `hi.json` - Hindi
- `pa.json` - Punjabi
- `ta.json` - Tamil
- `te.json` - Telugu
- `bn.json` - Bengali

## Language Switcher

The language switcher component is available in the header on all pages:
- Desktop: Globe icon in the top navigation
- Mobile: Language selector in the mobile menu

## Adding New Translations

1. Add the translation key to all language files in `/src/i18n/locales/`
2. Use the `t()` function in your component
3. For dynamic content, use interpolation:

\`\`\`typescript
t('welcome.message', { name: userName })
\`\`\`

## Configuration

See `/src/i18n/config.ts` for:
- Fallback language (English)
- Detection order (localStorage, then browser)
- Available languages list

## Fonts

The project uses Google Fonts for proper rendering of all scripts:
- **Cabinet Grotesk** & **Fraunces**: Latin script (English)
- **Noto Sans Devanagari**: Hindi (हिंदी)
- **Noto Sans Gurmukhi**: Punjabi (ਪੰਜਾਬੀ)
- **Noto Sans Tamil**: Tamil (தமிழ்)
- **Noto Sans Telugu**: Telugu (తెలుగు)
- **Noto Sans Bengali**: Bengali (বাংলা)

All fonts are loaded via Google Fonts CDN in `index.css`.
