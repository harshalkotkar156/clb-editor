
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/index.js';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Error from './pages/Error.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
    <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Error />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

        </Routes>


      
    </Provider>
  );
};

export default App;