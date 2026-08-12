import { useAuth } from '../context/AuthContext';
import HeadDashboard from './HeadDashboard';
import MemberDashboard from './MemberDashboard';

// Routes to the correct dashboard based on the logged-in user's role
const Dashboard = () => {
  const { user } = useAuth();
  return user.role === 'head' ? <HeadDashboard /> : <MemberDashboard />;
};

export default Dashboard;
