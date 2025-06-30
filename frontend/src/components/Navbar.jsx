import { FaSignInAlt, FaSignOutAlt, FaUser, FaComments } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className="navbar bg-base-200 shadow-md px-6 py-2">
      {/* left: logo/title */}
      <div className="navbar-start">
        <Link
          to="/"
          className="text-xl font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          DevHub
        </Link>
      </div>

      {/* right: auth links/buttons */}
      <div className="navbar-end space-x-2">
        {user ? (
          <>
            {/* NEW — Chats link */}
            <Link
              to="/chats"
              className="btn btn-outline btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              <FaComments />
              Chats
            </Link>

            <Link
              to="/create"
              className="btn btn-success btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              New Project
            </Link>

            <Link
              to="/profile"
              className="btn btn-outline btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              <FaUser />
              Profile
            </Link>

            <button
              onClick={onLogout}
              className="btn btn-outline btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn btn-outline btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              <FaSignInAlt />
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-outline btn-sm text-white border-indigo-400 hover:bg-indigo-600 hover:border-indigo-600 gap-2"
            >
              <FaUser />
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
