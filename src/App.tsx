import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Settings from './pages/Settings'
import Workspaces from './pages/Workspace'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Nhóm các route có chung Layout (App Shell) */}
        <Route path="/" element={<Layout />}>
            {/* Route index nghĩa là khi ở url '/', nó sẽ hiện Dashboard bên trong Layout */}
            <Route index element={<Dashboard />} />
            
            {/* Sau này bạn có thể thêm: */}
            {/* <Route path="workspaces" element={<WorkspaceList />} /> */}
        </Route>
        <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* 2. Thêm route settings */}
            <Route path="settings" element={<Settings />} /> 
        </Route>
        <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} /> 
            {/* 2. Thêm Route cho workspaces */}
            <Route path="workspaces" element={<Workspaces />} /> 
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;