import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import "./stylesheet.css";
import App from './App';
import { store } from './app/store';
import {AppProvider} from './context/AppContext';
import {AuthProvider} from './context/AuthContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppProvider>
        <AuthProvider>
          <App/>
        </AuthProvider>
      </AppProvider>
    </Provider>
  </React.StrictMode>
);
