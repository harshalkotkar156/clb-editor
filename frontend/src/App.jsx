

// import { Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from './app/store.js';
// import Home        from './pages/Home.jsx';
// import Dashboard   from './pages/Dashboard.jsx';
// import AuthCallback from './pages/AuthCallback.jsx';
// import Error       from './pages/Error.jsx';
// import Editor      from './pages/Editor.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import RoomPage    from './pages/RoomPage.jsx';

// const App = () => (
//   <Provider store={store}>
//     <Routes>
//       <Route path="/"               element={<Home />} />
//       <Route path="*"               element={<Error />} />
//       <Route path="/auth/callback"  element={<AuthCallback />} />

//       <Route path="/dashboard" element={
//         <ProtectedRoute><Dashboard /></ProtectedRoute>
//       } />

//       <Route path="/editor/:fileId" element={
//         <ProtectedRoute><Editor /></ProtectedRoute>
//       } />

//       <Route path="/editor/new" element={
//         <ProtectedRoute><Editor /></ProtectedRoute>
//       } />

//       {/* ✅ room page now protected — must be logged in */}
//       <Route path="/room/:roomId" element={
//         <ProtectedRoute><RoomPage /></ProtectedRoute>
//       } />
//     </Routes>
//   </Provider>
// );

// export default App;

// the above code is also working the below is adding some more feature

import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import Home         from './pages/Home.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Error        from './pages/Error.jsx';
import Editor       from './pages/Editor.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoomPage     from './pages/RoomPage.jsx';

const App = () => (
  <Provider store={store}>
    <Routes>
      <Route path="/"              element={<Home />} />
      <Route path="*"              element={<Error />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/editor/:fileId" element={
        <ProtectedRoute><Editor /></ProtectedRoute>
      } />

      <Route path="/editor/new" element={
        <ProtectedRoute><Editor /></ProtectedRoute>
      } />

      {/* ✅ collab route — joiner lands here via shared link */}
      <Route path="/room/:roomId" element={
        <ProtectedRoute><RoomPage /></ProtectedRoute>
      } />

      {/* ✅ editor with collab session pre-loaded */}
      <Route path="/editor/collab-:roomId" element={
        <ProtectedRoute><Editor /></ProtectedRoute>
      } />
    </Routes>
  </Provider>
);

export default App;