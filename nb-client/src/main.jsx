import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#e5e5e5',
            border: '1px solid #242424',
            fontFamily: '"Barlow", sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#f5c518', secondary: '#0a0a0a' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
