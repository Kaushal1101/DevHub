// Import routing components for client-side routes
import { Routes, Route } from 'react-router-dom';

//see where to implement this in the navigation controller 
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Import page components
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';

// Navigation controller for all app routes
const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/create" element={<CreateProjectPage />} />
  </Routes>
);

export default App;