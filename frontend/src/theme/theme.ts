import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2BA361',
    colorSuccess: '#2BA361',
    colorWarning: '#f7bb16',
    colorError: '#D32F2F',
    borderRadius: 8,
    fontFamily: 'var(--font-inter), sans-serif',
    controlHeight: 40,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      fontFamily: 'var(--font-plus-jakarta), sans-serif',
      fontWeight: 600,
    },
    Input: {
      controlHeight: 40,
      fontFamily: 'var(--font-inter), sans-serif',
    },
    Form: {
      labelFontSize: 14,
    },
    Typography: {
      fontFamily: 'var(--font-inter), sans-serif',
    },
  },
};
