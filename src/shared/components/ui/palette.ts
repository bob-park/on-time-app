import { useColorScheme } from 'react-native';

// className 을 받을 수 없는 native prop(Icon tint, Switch, ActivityIndicator, RefreshControl 등)용 hex.
// 값은 src/app/global.css 의 @theme 토큰과 동일하게 유지한다.
export type Palette = {
  brand: string;
  content: string;
  muted: string;
  danger: string;
  success: string;
  surface: string;
  base: string;
  border: string;
};

export const PALETTE: Record<'light' | 'dark', Palette> = {
  light: {
    brand: '#7132f5',
    content: '#101114',
    muted: '#9497a9',
    danger: '#e0455a',
    success: '#149e61',
    surface: '#ffffff',
    base: '#f7f7fa',
    border: '#dedee5',
  },
  dark: {
    brand: '#855bfb',
    content: '#f2f2f7',
    muted: '#9497a9',
    danger: '#ff9aa8',
    success: '#149e61',
    surface: '#17171f',
    base: '#0b0b10',
    border: '#26262f',
  },
};

export function usePalette(): Palette {
  return PALETTE[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
