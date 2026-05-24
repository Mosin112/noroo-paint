// Typography tokens from PRD §3.2.
// Helvetica Neue is the prototype font; falls back to system on Android.

import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'Helvetica Neue',
  android: 'Roboto', // Roboto is the system sans; closest to Helvetica visually
  default: 'Helvetica Neue',
});

export const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'Menlo',
});

export type TextVariant =
  | 'screenH1'
  | 'subHeading'
  | 'navTitle'
  | 'fieldLabel'
  | 'fieldLabelAccent'
  | 'fieldValue'
  | 'tileLabel'
  | 'tileTitle'
  | 'chip'
  | 'rowTitle'
  | 'rowSubtitle'
  | 'price'
  | 'cta'
  | 'summaryKey'
  | 'summaryValue'
  | 'alertBody'
  | 'smallNote'
  | 'statusBar'
  | 'footerLink';

import type { TextStyle } from 'react-native';
import { colors } from './colors';

export const text: Record<TextVariant, TextStyle> = {
  screenH1: { fontFamily, fontSize: 24, fontWeight: '600', letterSpacing: -0.24, color: colors.ink },
  subHeading: { fontFamily, fontSize: 12.5, fontWeight: '400', color: colors.muted, lineHeight: 17.5 },
  navTitle: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.ink },
  fieldLabel: { fontFamily, fontSize: 9.5, fontWeight: '400', letterSpacing: 0.95, color: colors.muted, textTransform: 'uppercase' },
  fieldLabelAccent: { fontFamily, fontSize: 9.5, fontWeight: '400', letterSpacing: 0.95, color: colors.accent, textTransform: 'uppercase' },
  fieldValue: { fontFamily, fontSize: 14, fontWeight: '600', color: colors.ink },
  tileLabel: { fontFamily, fontSize: 11, fontWeight: '400', letterSpacing: 1.1, color: colors.muted, textTransform: 'uppercase' },
  tileTitle: { fontFamily, fontSize: 15, fontWeight: '600', color: colors.ink },
  chip: { fontFamily, fontSize: 12, fontWeight: '400', color: colors.ink2 },
  rowTitle: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.ink },
  rowSubtitle: { fontFamily, fontSize: 11, fontWeight: '400', color: colors.muted },
  price: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.ink },
  cta: { fontFamily, fontSize: 14, fontWeight: '600', color: '#fff' },
  summaryKey: { fontFamily, fontSize: 13, fontWeight: '400', color: colors.muted },
  summaryValue: { fontFamily, fontSize: 13, fontWeight: '600', color: colors.ink },
  alertBody: { fontFamily, fontSize: 12, fontWeight: '400', color: colors.ink2, lineHeight: 18 },
  smallNote: { fontFamily, fontSize: 10.5, fontStyle: 'italic', color: colors.warn, lineHeight: 14.7 },
  statusBar: { fontFamily, fontSize: 12, fontWeight: '600', color: colors.ink },
  footerLink: { fontFamily, fontSize: 12, fontWeight: '400', color: colors.accent, textDecorationLine: 'underline' },
};
