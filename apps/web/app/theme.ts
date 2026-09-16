import {
  createTheme,
  defaultVariantColorsResolver,
  parseThemeColor,
  type CSSVariablesResolver,
  type VariantColorsResolver,
} from '@mantine/core';

const variantColorResolver: VariantColorsResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input);
  const parsed = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  if (input.variant === 'filled' && parsed.color === 'forest') {
    return {
      ...resolved,
      color: 'var(--mantine-color-white)',
      hoverColor: 'var(--mantine-color-white)',
    };
  }

  return resolved;
};

export const theme = createTheme({
  primaryColor: 'forest',
  primaryShade: { light: 7, dark: 5 },
  autoContrast: true,
  variantColorResolver,
  defaultRadius: 'md',
  white: 'oklch(98% 0.01 150)',
  colors: {
    forest: [
      'oklch(97% 0.015 150)',
      'oklch(93% 0.03 150)',
      'oklch(86% 0.05 150)',
      'oklch(76% 0.07 150)',
      'oklch(65% 0.09 150)',
      'oklch(55% 0.10 150)',
      'oklch(45% 0.11 150)',
      'oklch(40% 0.08 150)',
      'oklch(32% 0.09 150)',
      'oklch(26% 0.08 150)',
    ],
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': 'var(--mantine-color-forest-0)',
  },
  dark: {},
});
