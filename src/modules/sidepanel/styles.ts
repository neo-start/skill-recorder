import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    color: #1f2937;
    background: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }
  button { font-family: inherit; cursor: pointer; }
`;

export const colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: '#1f2937',
  textMuted: '#6b7280',
  accent: '#dc2626',
  accentHover: '#b91c1c',
  stop: '#374151',
  stopHover: '#1f2937',
};
