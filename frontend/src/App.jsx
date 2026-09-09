import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDetails from './pages/GroupDetails';
import MemberManagement from './pages/MemberManagement';
import Savings from './pages/Savings';
import MyLoans from './pages/MyLoans';
import Meetings from './pages/Meetings';
import './styles/app.css';
import MemberMeetings from './pages/MemberMeetings';
import Attendance from './pages/Attendance';
import MyFines from './pages/MyFines';
import MyAttendance from "./pages/MyAttendance";
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-group"
        element={
          <ProtectedRoute roles={['head']}>
            <Layout><CreateGroup /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/my-meetings"
  element={
    <ProtectedRoute roles={['member']}>
      <Layout>
        <MemberMeetings />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/my-attendance"
  element={
    <ProtectedRoute roles={['member']}>
      <Layout>
        <MyAttendance />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/my-fines"
  element={
    <ProtectedRoute roles={['member']}>
      <Layout>
        <MyFines />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route
  path="/meetings/:meetingId/attendance"
  element={
    <ProtectedRoute roles={['head']}>
      <Layout>
        <Attendance />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route
        path="/join-group"
        element={
          <ProtectedRoute roles={['member']}>
            <Layout><JoinGroup /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/my-meetings"
  element={
    <ProtectedRoute roles={['member']}>
      <Layout>
        <MemberMeetings />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route
        path="/group"
        element={
          <ProtectedRoute>
            <Layout><GroupDetails /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute roles={['head']}>
            <Layout><MemberManagement /></Layout>
          </ProtectedRoute>
        }
      />
 <Route
  path="/meetings"
  element={
    <ProtectedRoute roles={['head']}>
      <Layout>
        <Meetings />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route
  path="/savings"
  element={
    <ProtectedRoute roles={['head']}>
      <Layout>
        <Savings />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/my-loans"
  element={
    <ProtectedRoute roles={['member']}>
      <Layout>
        <MyLoans />
      </Layout>
    </ProtectedRoute>
  }
/>
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
