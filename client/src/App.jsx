import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import { Loading } from './components/ui.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Repository from './pages/Repository.jsx';
import ProcessForm from './pages/ProcessForm.jsx';
import Discovery from './pages/Discovery.jsx';
import ProcessMap from './pages/ProcessMap.jsx';
import Analysis from './pages/Analysis.jsx';
import Compare from './pages/Compare.jsx';
import ProcessDetails from './pages/ProcessDetails.jsx';
import NotFound from './pages/NotFound.jsx';
import Landing from './pages/Landing.jsx';

function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return location.pathname === '/' ? <Landing /> : <Navigate to="/login" replace state={{ from: location }} />;
  // New accounts answer the setup questions first; once done, /welcome is no longer needed.
  const done = !!user.onboarding?.completed;
  if (!done && location.pathname !== '/welcome') return <Navigate to="/welcome" replace />;
  if (done && location.pathname === '/welcome') return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="welcome" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="processes" element={<Repository />} />
          <Route path="processes/new" element={<ProcessForm />} />
          <Route path="processes/:id" element={<ProcessDetails />} />
          <Route path="processes/:id/edit" element={<ProcessForm />} />
          <Route path="processes/:id/map" element={<ProcessMap />} />
          <Route path="processes/:id/analysis" element={<Analysis />} />
          <Route path="map" element={<ProcessMap />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="compare" element={<Compare />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
