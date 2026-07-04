import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#4F46E5',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#E11D48',
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
