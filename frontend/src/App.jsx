import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Import contexts
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

// Import QueryClient
import { queryClient } from '@/lib/api/queryClient';

// Import App Routes
import AppRoutes from '@/app/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="App">
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
