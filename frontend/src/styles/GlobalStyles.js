import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
    min-height: 100vh;
    color: #e0e0e0;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a2e;
  }

  ::-webkit-scrollbar-thumb {
    background: #3a3a5e;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #4a4a7e;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;

export const theme = {
  colors: {
    primary: '#6c5ce7',
    primaryLight: '#a29bfe',
    danger: '#ff4757',
    dangerBg: 'rgba(255, 71, 87, 0.1)',
    success: '#00d26a',
    successBg: 'rgba(0, 210, 106, 0.1)',
    warning: '#ffa502',
    warningBg: 'rgba(255, 165, 2, 0.1)',
    background: '#0a0a0f',
    backgroundLight: '#1a1a2e',
    card: '#16162a',
    cardHover: '#1e1e3a',
    border: '#2a2a4a',
    text: '#e0e0e0',
    textSecondary: '#8888aa',
    textMuted: '#5a5a7a',
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    glow: '0 0 30px rgba(108, 92, 231, 0.3)',
    dangerGlow: '0 0 20px rgba(255, 71, 87, 0.4)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  }
};
