import React from 'react';
import { BrowserLayout } from './components/BrowserLayout';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <>
      <BrowserLayout />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.17 0 0)',
            border: '1px solid oklch(0.28 0 0)',
            color: 'oklch(0.92 0 0)',
          }
        }}
      />
    </>
  );
}
