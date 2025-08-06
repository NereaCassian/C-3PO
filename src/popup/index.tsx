import React from 'react';
import ReactDOM from 'react-dom/client';
import { Translator } from './components/translator';
import '../styles/globals.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Translator />
  </React.StrictMode>
);