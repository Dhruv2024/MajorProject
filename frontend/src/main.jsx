import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { configureStore } from "@reduxjs/toolkit"
import rootReducer from './reducer/index.js'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SocketProvider from "./provider/socketProvider.jsx";
import ThemeProvider from './provider/themeProvider.jsx'

const store = configureStore({
  reducer: rootReducer,
})

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  </Provider>
  // </StrictMode>,
)
