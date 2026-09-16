import {BrowserRouter} from 'react-router-dom';
import {CssBaseline,ThemeProvider} from '@mui/material';
import {useApp} from './context/AppContext';
import {useAuth} from './context/AuthContext';
import {getTheme,getClientTheme} from './theme/theme';
import AppRoutes from './routes/AppRoutes';
export default function App(){
  const {settings}=useApp();
  const {user}=useAuth();
  const theme=user?.role==='Customer'?getClientTheme():getTheme(settings.darkMode);
  return <ThemeProvider theme={theme}><CssBaseline/><BrowserRouter><AppRoutes/></BrowserRouter></ThemeProvider>;
}
