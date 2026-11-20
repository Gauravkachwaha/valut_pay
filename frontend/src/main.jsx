import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

/*
  To enable Google OAuth:
  1. Go to console.cloud.google.com
  2. Create new project or select existing
  3. Enable Google+ API / Google Identity Services
  4. Go to Credentials → Create OAuth 2.0 Client ID
  5. Application type: Web application
  6. Authorized origins: http://localhost:5173
  7. Authorized redirect URIs: http://localhost:5173
  8. Copy Client ID to .env as VITE_GOOGLE_CLIENT_ID
  9. Also add client ID and secret to backend:
     finpay-platform/.env:
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret

     And in auth-service application.yml:
     google:
       oauth:
         client-id: ${GOOGLE_CLIENT_ID:your-client-id}
         client-secret: ${GOOGLE_CLIENT_SECRET:your-secret}
         redirect-uri: http://localhost:5173/auth/google/callback
*/

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #2a2a2a',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
