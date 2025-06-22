import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

// Bootstrap components
import {
  Container, Navbar as BootstrapNavbar, Nav, Form, Button, Card, Modal,
  Spinner, Alert, ListGroup, InputGroup, Image, Row, Col, Dropdown, Badge,
  Toast, ToastContainer
} from 'react-bootstrap';

// React Icons
import {
  BsHeart, BsHeartFill, BsXCircle, BsXCircleFill, BsChatDots, BsPersonCircle, BsBoxArrowRight,
  BsGearFill, BsImages, BsPaperclip, BsGeoAltFill, BsSearch, BsThreeDotsVertical,
  BsSendFill, BsArrowLeft, BsCheckCircleFill, BsExclamationTriangleFill, BsInfoCircleFill,
  BsEyeFill, BsEyeSlashFill, BsStars
} from 'react-icons/bs';
import { FaUserEdit, FaUserPlus, FaSignInAlt, FaVenusMars, FaBirthdayCake, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

// --- Global Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dating-pieg.onrender.com';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'https://dating-pieg.onrender.com';

// --- Embedded Styles ---
const GlobalStyles = () => (
  <style jsx global>{`
    :root {
      --primary-color: #2563EB; /* Blue */
      --primary-color-dark: #1D4ED8;
      --accent-color: #EC4899; /* Pink */
      --accent-color-dark: #DB2777;
      --pass-color: #EF4444; /* Red */
      --pass-color-dark: #DC2626;
      --success-color: #10B981; /* Green */
      --success-color-dark: #059669;
      --background-color: #F3F4F6; /* Light Gray */
      --surface-color: #FFFFFF; /* White */
      --text-primary: #111827; /* Almost Black */
      --text-secondary: #6B7280; /* Gray */
      --border-color: #D1D5DB; /* Light border */
      --input-background: #F9FAFB; /* Slightly off-white for inputs */
    }

    .btn-primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
      font-weight: 500;
    }
    .btn-primary:hover {
      background-color: var(--primary-color-dark) !important;
      border-color: var(--primary-color-dark) !important;
    }
    .btn-primary:active, .btn-primary:focus {
      transform: scale(0.98);
      box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.3) !important;
    }

    .btn-success {
      background-color: var(--success-color) !important;
      border-color: var(--success-color) !important;
      font-weight: 500;
    }
    .btn-success:hover {
      background-color: var(--success-color-dark) !important;
      border-color: var(--success-color-dark) !important;
    }
    
    .btn-danger {
        background-color: var(--pass-color) !important;
        border-color: var(--pass-color) !important;
        font-weight: 500;
    }
    .btn-danger:hover {
        background-color: var(--pass-color-dark) !important;
        border-color: var(--pass-color-dark) !important;
    }

    .btn-accent {
      background-color: var(--accent-color) !important;
      border-color: var(--accent-color) !important;
      color: white !important;
      font-weight: 500;
    }
    .btn-accent:hover {
      background-color: var(--accent-color-dark) !important;
      border-color: var(--accent-color-dark) !important;
    }

    .form-control {
        border: 1px solid var(--border-color);
        background-color: var(--input-background);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-control:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.25) !important;
      background-color: var(--surface-color);
    }
    .form-label {
        font-weight: 500;
        color: var(--text-primary);
    }

    .navbar-brand-custom {
      font-weight: 700;
      font-size: 1.6rem; /* Slightly larger */
      color: var(--primary-color) !important;
      letter-spacing: -0.5px;
    }
    .navbar-custom {
      background-color: var(--surface-color) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); /* Softer shadow */
      padding-top: 12px;
      padding-bottom: 12px;
    }
    .nav-link-custom {
      color: var(--text-secondary) !important;
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      border-radius: 0.375rem; /* Rounded pill effect for links */
      transition: color 0.2s ease, background-color 0.2s ease;
    }
    .nav-link-custom:hover {
      color: var(--primary-color) !important;
      background-color: rgba(37, 99, 235, 0.1);
    }
    .nav-link-custom.active {
      color: var(--primary-color) !important;
      font-weight: 600; /* Bolder active link */
      background-color: rgba(37, 99, 235, 0.1);
    }
    .profile-dropdown-img {
      border: 2px solid var(--primary-color);
    }
    .dropdown-menu {
        border-radius: 0.5rem !important;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
        border: 1px solid var(--border-color) !important;
    }
    .dropdown-item:active {
        background-color: var(--primary-color) !important;
        color: white !important;
    }


    .card-custom {
      border: none; /* Remove default border, rely on shadow */
      border-radius: 0.75rem; 
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* More pronounced shadow */
      overflow: hidden; 
    }
    .card-header-custom {
        background-color: var(--primary-color);
        color: white;
        padding: 1.25rem 1.5rem; /* More padding */
        border-bottom: none;
        font-weight: 600;
    }
    .card-footer-custom {
        background-color: var(--surface-color);
        border-top: 1px solid var(--border-color);
    }
    
    .toast-container .toast {
        border-radius: 0.5rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        border: none;
    }
    .toast-header {
        font-weight: 600; /* Bold header */
        border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .toast-success .toast-header { background-color: var(--success-color) !important; color: white !important; }
    .toast-error .toast-header { background-color: var(--pass-color) !important; color: white !important; }
    .toast-info .toast-header { background-color: var(--primary-color) !important; color: white !important; }

    .discover-card-img {
        height: 100%; /* Image takes full height of its container */
        width: 100%;
        object-fit: cover;
        position: absolute;
        top:0; left:0;
        border-radius: 0.75rem; /* Match card radius */
    }
    .discover-card {
        height: 75vh; /* Fixed height for discover cards */
        max-height: 600px; /* Max height */
        width: 100%;
        max-width: 380px; /* Max width for discover cards on larger screens */
        display: flex; /* Will be overridden by motion.div to some extent */
        flex-direction: column;
        position: relative; /* For positioning overlay and actions */
        border-radius: 0.75rem;
    }
    .discover-card-content-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem; /* More padding */
        background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%);
        color: white;
        border-bottom-left-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
    }
    .discover-card-content-overlay .card-title, 
    .discover-card-content-overlay .card-subtitle, 
    .discover-card-content-overlay .card-text {
        color: white !important;
        text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
    }
     .discover-card-content-overlay .card-title {
        font-size: 1.75rem; /* Larger title */
        font-weight: 700;
    }
    .discover-card-content-overlay .badge {
        background-color: rgba(255,255,255,0.15) !important;
        color: white !important;
        border: 1px solid rgba(255,255,255,0.25);
        padding: 0.4em 0.8em; /* Better badge padding */
        font-weight: 500;
    }
    .discover-actions {
        display: flex;
        gap: 1.5rem;
        margin-top: 2rem; /* Space above action buttons */
        z-index: 10; /* Ensure they are on top if cards overlap conceptually */
    }
    .discover-actions .btn {
        width: 70px; 
        height: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem; 
        box-shadow: 0 6px 12px rgba(0,0,0,0.15); /* Softer but noticeable shadow */
        transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
    }
    .discover-actions .btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    .btn-pass { background-color: var(--pass-color) !important; border-color: transparent !important; color: white !important; }
    .btn-like { background-color: var(--accent-color) !important; border-color: transparent !important; color: white !important; }

    .chat-message-area {
        background-color: var(--background-color);
    }
    .message-bubble {
        padding: 0.6rem 1rem; /* Slightly more padding */
        word-break: break-word;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08); /* Softer shadow for bubbles */
    }
    .message-bubble.sender {
        background-color: var(--primary-color) !important;
        color: white !important;
        border-radius: 1.25rem 1.25rem 0.25rem 1.25rem !important; 
    }
    .message-bubble.receiver {
        background-color: var(--surface-color) !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--border-color);
        border-radius: 1.25rem 1.25rem 1.25rem 0.25rem !important; 
    }
    .chat-input-form {
        background-color: var(--surface-color);
        border-top: 1px solid var(--border-color);
        padding: 0.75rem 1rem !important; /* Standardized padding */
    }
    .chat-input-form .form-control {
        border-radius: 2rem;
        padding: 0.75rem 1.25rem;
        border: 1px solid var(--border-color);
        background-color: var(--input-background);
    }
    .chat-input-form .form-control:focus {
         background-color: var(--surface-color);
    }
    .chat-send-btn {
        background-color: var(--primary-color) !important;
        transition: background-color 0.2s ease;
    }
    .chat-send-btn:hover {
        background-color: var(--primary-color-dark) !important;
    }
    /* Styles for ChatPage full height */
    .chat-page-container {
        display: flex;
        flex-direction: column;
        height: 100vh; /* Full viewport height */
        padding-top: var(--navbar-height, 68px); /* Adjust based on your actual navbar height */
        box-sizing: border-box;
    }
    .chat-page-container .chat-message-area {
        flex-grow: 1;
        overflow-y: auto;
        padding-bottom: 1rem; /* Space for last message */
        /* margin-top: 56px;  Replaced by padding-top on container and fixed navbar */
    }
    .chat-page-container .chat-input-form {
        flex-shrink: 0; /* Prevent input from shrinking */
    }
    .page-container {
      padding-top: calc(var(--navbar-height, 68px) + 1.5rem); /* Standard padding for other pages */
      padding-bottom: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
  `}</style>
);

// --- Axios Instance ---
const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Toast Context & Hook ---
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, title, message) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100, transition: { duration: 0.3, ease:"easeIn" } }}
                            layout
                        >
                            <Toast onClose={() => removeToast(toast.id)} className={`mb-2 toast-${toast.type}`} bg={toast.type}>
                                <Toast.Header closeButton={true} className={`text-white bg-${toast.type}`}>
                                    {toast.type === 'success' && <BsCheckCircleFill className="me-2" />}
                                    {toast.type === 'error' && <BsExclamationTriangleFill className="me-2" />}
                                    {toast.type === 'info' && <BsInfoCircleFill className="me-2" />}
                                    <strong className="me-auto">{toast.title}</strong>
                                </Toast.Header>
                                {toast.message && <Toast.Body className={toast.type === 'light' ? 'text-dark' : ''}>{toast.message}</Toast.Body>}
                            </Toast>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </ToastContainer>
        </ToastContext.Provider>
    );
};


// --- Auth Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [loadingAuth, setLoadingAuth] = useState(true);
  const toastContext = useToast();


  const fetchCurrentUser = async (currentToken) => {
      if (!currentToken) {
          logout(false); // Pass false to not show toast on initial load if not logged in
          setLoadingAuth(false);
          return;
      }
      try {
          const decodedToken = jwtDecode(currentToken);
          if (decodedToken.exp * 1000 < Date.now()) {
              if (toastContext) toastContext.addToast('info', 'Session Expired', 'Please log in again.');
              logout(false);
              return;
          }
          const storedUser = JSON.parse(localStorage.getItem('authUser'));
          if (storedUser && storedUser._id === decodedToken.userId) {
              setUser(storedUser);
              setIsAuthenticated(true);
          } else {
              console.warn("Auth: Token exists but no valid local user or ID mismatch. Logging out.");
              logout(false);
          }
      } catch (error) {
          console.error("Auth: Error processing token:", error);
          if (toastContext) toastContext.addToast('error', 'Authentication Error', 'Invalid session. Please log in.');
          logout(false);
      } finally {
          setLoadingAuth(false);
      }
  };

  useEffect(() => {
      const storedToken = localStorage.getItem('authToken');
      // Delay slightly to ensure toastContext is available
      const timer = setTimeout(() => fetchCurrentUser(storedToken), 0);
      return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // toastContext is stable from provider, no need to list. Only run on mount.


  const login = async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('authUser', JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    if (toastContext) toastContext.addToast('success', 'Login Successful!', `Welcome back, ${response.data.user.name}!`);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await apiClient.post('/register', { name, email, password });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('authUser', JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    if (toastContext) toastContext.addToast('success', 'Registered!', `Welcome, ${response.data.user.name}! Complete your profile.`);
    return response.data;
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    if (showToast && toastContext) toastContext.addToast('info', 'Logged Out', 'See you soon!');
  };

  const updateUserContext = (updatedUserData) => {
    setUser(prevUser => {
        const newUser = { ...prevUser, ...updatedUserData };
        localStorage.setItem('authUser', JSON.stringify(newUser));
        return newUser;
    });
  };

  const contextValue = { user, token, isAuthenticated, login, register, logout, updateUserContext, loadingAuth };

  if (loadingAuth && !toastContext) {
      return <FullPageSpinner message="Initializing App..." />;
  }
  if (loadingAuth) {
    return <FullPageSpinner message="Verifying session..." />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- Socket.IO Context ---
const SocketContext = createContext(null);
const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user, token } = useAuth(); // Get token from useAuth
  const { addToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user?._id && token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token // Use the token from AuthContext
        }
      });
      newSocket.on('connect', () => {
        console.log('Socket: Connected', newSocket.id);
        if (user?._id) {
            newSocket.emit('join', user._id);
        } else {
            console.warn("Socket: User ID not available for join event on connect.");
        }
      });
      newSocket.on('disconnect', (reason) => {
        console.log('Socket: Disconnected', reason);
        if (reason === "io server disconnect") {
            // Potentially due to auth error from server mid-session
            addToast('error', 'Connection Issue', 'Disconnected from chat server. Please refresh.');
        }
      });
      newSocket.on('connect_error', (err) => {
        console.error('Socket: Connection Error', err.message, err.data);
        addToast('error', 'Socket Connection Failed', `Could not connect: ${err.message}. Ensure server is running.`);
      });
      
      newSocket.on('messageError', (errorData) => {
        console.error('Socket: Received messageError from server:', errorData);
        addToast('error', 'Chat Error', errorData.message || 'A problem occurred in chat.');
      });

      setSocket(newSocket);
      return () => { 
        newSocket.disconnect(); 
        setSocket(null); 
        console.log('Socket: Cleaned up.'); 
      };
    } else if (socket) { // If no longer authenticated or token missing, ensure existing socket is disconnected
      socket.disconnect();
      setSocket(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id, token, addToast]); // Removed socket from deps, addToast is stable

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
const useSocket = () => useContext(SocketContext);

// --- UI Components ---
const FullPageSpinner = ({ message = "Loading..." }) => (
  <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--background-color)' }}>
    <Spinner animation="border" role="status" style={{ width: '4rem', height: '4rem', color: 'var(--primary-color)' }}>
      <span className="visually-hidden">{message}</span>
    </Spinner>
    <p className="mt-3 fs-5 fw-medium" style={{color: 'var(--text-secondary)'}}>{message}</p>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};
const pageTransition = { type: 'spring', stiffness: 260, damping: 25 };
const AnimatedPage = ({ children, className = "" }) => (
  <motion.div
    className={`page-container ${className}`}
    initial="initial" animate="in" exit="out"
    variants={pageVariants} transition={pageTransition}
  >
    {children}
  </motion.div>
);

const ProtectedContent = ({ children }) => {
    const { isAuthenticated, user, loadingAuth } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loadingAuth) {
            if (!isAuthenticated) {
                navigate("/login", { state: { from: location }, replace: true });
            } else if (user && !user.isProfileComplete && location.pathname !== '/complete-profile') {
                navigate("/complete-profile", { state: { from: location }, replace: true });
            } else if (user && user.isProfileComplete && (location.pathname === '/complete-profile' || location.pathname === '/login' || location.pathname === '/register')) {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, user, location, navigate, loadingAuth]);

    if (loadingAuth) return <FullPageSpinner message="Verifying access..." />;

    if (!isAuthenticated) return null;
    if (user && !user.isProfileComplete && location.pathname !== '/complete-profile') return null;
    if (user && user.isProfileComplete && (location.pathname === '/complete-profile' || location.pathname === '/login' || location.pathname === '/register')) return null;

    return children;
};

const AppNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkClasses = (path) => 
    `nav-link-custom mx-1 ${location.pathname === path ? 'active' : ''}`;
  
  const defaultAvatar = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=2563EB&color=fff&size=40&bold=true&rounded=true` : '';
  const profilePic = user?.profile_pic ? `${user.profile_pic}` : defaultAvatar;


  return (
    <BootstrapNavbar expand="lg" fixed="top" className="navbar-custom" style={{'--navbar-height': '68px'}}>
      <Container>
        <BootstrapNavbar.Brand as={Link} to={isAuthenticated && user ? "/" : "/login"} className="navbar-brand-custom">
          <BsHeartFill className="me-2" style={{color: 'var(--accent-color)'}} /> SoulSync
        </BootstrapNavbar.Brand>
        {isAuthenticated && user && (
          <>
            <BootstrapNavbar.Toggle aria-controls="app-navbar-nav" />
            <BootstrapNavbar.Collapse id="app-navbar-nav">
              <Nav className="ms-auto align-items-center">
                {user.isProfileComplete && (
                  <>
                    <Nav.Link as={Link} to="/discover" className={navLinkClasses("/discover")}><BsStars className="me-1"/>Discover</Nav.Link>
                    <Nav.Link as={Link} to="/matches" className={navLinkClasses("/matches")}><BsChatDots className="me-1"/>Matches</Nav.Link>
                  </>
                )}
                <Dropdown align="end" className="ms-lg-3 ms-0 mt-2 mt-lg-0">
                  <Dropdown.Toggle as={Nav.Link} id="dropdown-profile" className="p-0 d-flex align-items-center">
                     <Image
                        src={profilePic}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius:'50%' }} // Ensure rounded for non-ui-avatar pics
                        className="profile-dropdown-img"
                      />
                      <span className="ms-2 d-none d-lg-inline fw-medium" style={{color: 'var(--text-primary)'}}>{user.name}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText className="fw-bold" style={{color: 'var(--text-primary)'}}>{user.name}</Dropdown.ItemText>
                    <Dropdown.ItemText className="text-muted small">{user.email}</Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center"><BsPersonCircle className="me-2"/>Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center"><BsBoxArrowRight className="me-2"/>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </BootstrapNavbar.Collapse>
          </>
        )}
      </Container>
    </BootstrapNavbar>
  );
};

// --- Page Components ---
const AuthFormCard = ({ title, subtitle, children }) => (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring", stiffness:100 }}>
        <Card className="card-custom" style={{ width: '100%', maxWidth: '450px' }}>
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.1, type:'spring', stiffness:150}}>
                    <BsHeartFill size={60} className="mb-3" style={{color: 'var(--accent-color)'}}/>
                </motion.div>
                <h2 className="fw-bold" style={{color: 'var(--text-primary)'}}>{title}</h2>
                <p style={{color: 'var(--text-secondary)'}}>{subtitle}</p>
            </div>
            {children}
          </Card.Body>
        </Card>
    </motion.div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, loadingAuth } = useAuth(); // Add user, loadingAuth
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) { // Check loadingAuth before redirect
      if (user && !user.isProfileComplete) {
        navigate('/complete-profile', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from, loadingAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await login(email, password); 
      // Navigation is handled by useEffect
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast('error', 'Login Failed', errMsg);
    } finally { setLoading(false); }
  };
  if (loadingAuth) return <FullPageSpinner message="Loading login..." />;
  if (!loadingAuth && isAuthenticated) return <FullPageSpinner message="Redirecting..." />; // Show spinner during redirect

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <AuthFormCard title="Welcome Back!" subtitle="Login to find your SoulSync.">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup>
                <Form.Control type={showPassword ? "text" : "password"} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} style={{borderColor: 'var(--border-color)'}}>
                    {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                </Button>
            </InputGroup>
          </Form.Group>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="primary" type="submit" className="w-100 mt-2 py-2 fs-5 fw-medium" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSignInAlt className="me-2"/>Login</>}
            </Button>
          </motion.div>
        </Form>
        <div className="mt-4 text-center">
          <small style={{color: 'var(--text-secondary)'}}>New to SoulSync? <Link to="/register" style={{color: 'var(--primary-color)', fontWeight: '500'}}>Sign up here</Link></small>
        </div>
      </AuthFormCard>
    </Container>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, loadingAuth } = useAuth(); // Added loadingAuth
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { 
    if (!loadingAuth && isAuthenticated) navigate('/complete-profile', {replace: true}); // Check loadingAuth
  }, [isAuthenticated, navigate, loadingAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { addToast('error', 'Validation Error', 'Passwords do not match.'); return; }
    if (password.length < 6) { addToast('error', 'Validation Error', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      // Navigation handled by useEffect
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast('error', 'Registration Failed', errMsg);
    } finally { setLoading(false); }
  };
  if (loadingAuth) return <FullPageSpinner message="Loading registration..." />;
  if (!loadingAuth && isAuthenticated) return <FullPageSpinner message="Redirecting..." />; // Show spinner during redirect

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
       <AuthFormCard title="Create Your Account" subtitle="Join SoulSync and start your journey.">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerName"><Form.Label>Full Name</Form.Label><Form.Control type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="registerEmail"><Form.Label>Email address</Form.Label><Form.Control type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></Form.Group>
          <Form.Group className="mb-3" controlId="registerPassword"><Form.Label>Password</Form.Label>
            <InputGroup>
                <Form.Control type={showPassword ? "text" : "password"} placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} style={{borderColor: 'var(--border-color)'}}> {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}</Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-4" controlId="registerConfirmPassword"><Form.Label>Confirm Password</Form.Label><Form.Control type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></Form.Group>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="primary" type="submit" className="w-100 mt-2 py-2 fs-5 fw-medium" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserPlus className="me-2"/>Register</>}
            </Button>
          </motion.div>
        </Form>
        <div className="mt-4 text-center">
          <small style={{color: 'var(--text-secondary)'}}>Already a member? <Link to="/login" style={{color: 'var(--primary-color)', fontWeight: '500'}}>Login here</Link></small>
        </div>
      </AuthFormCard>
    </Container>
  );
};

const ProfileFormPage = ({ isEditingMode = false }) => {
  const { user, updateUserContext } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', bio: '', age: '', gender: 'Male', interests: [],
    preferences: { gender: 'Any', ageRange: { min: '', max: '' } },
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const picInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', bio: user.bio || '', age: user.age || '', gender: user.gender || 'Male',
        interests: user.interests || [],
        preferences: user.preferences || { gender: 'Any', ageRange: { min: 18, max: 50 } },
      });
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'S')}&background=2563EB&color=fff&size=150&bold=true&rounded=true`;
      setProfilePicPreview(user.profile_pic ? `${user.profile_pic}` : defaultAvatar);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valToSet = name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value;
    if (name === 'age' && (isNaN(valToSet) && value !== '')) return;
    setFormData(prev => ({ ...prev, [name]: valToSet }));
  };

  const handlePrefChange = (e, fieldType) => {
    const { name, value } = e.target;
    if (fieldType === 'gender') {
        setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, gender: value } }));
    } else if (fieldType === 'ageRange') {
        const valToSet = value === '' ? '' : parseInt(value, 10);
        if (isNaN(valToSet) && value !== '') return;
        setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, ageRange: { ...prev.preferences.ageRange, [name]: valToSet } } }));
    }
  };

  const handleInterestAdd = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim()) && formData.interests.length < 10) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, currentInterest.trim()] }));
      setCurrentInterest('');
    } else if (formData.interests.length >= 10) {
      addToast('info', 'Interest Limit', 'Max 10 interests allowed.');
    } else if (!currentInterest.trim()){
      addToast('info', 'Empty Interest', 'Please type an interest.');
    }
  };
  const handleInterestRemove = (interest) => setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { addToast('error', "File Too Large", "Max 5MB for profile picture."); return; }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) { addToast('error', "Invalid File Type", "Only JPG, PNG, GIF images allowed."); return; }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) { addToast('error', 'Geolocation Error', 'Geolocation is not supported by your browser.'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await apiClient.post('/update-location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
          updateUserContext({ location: res.data.location }); // Use location from response
          addToast('success', 'Location Updated!', 'Your location helps find better matches.');
        } catch (err) { addToast('error', 'Location Update Failed', err.response?.data?.message || 'Could not update location.'); }
        finally { setLocationLoading(false); }
      },
      (err) => { addToast('error', 'Location Access Denied', err.message); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!isEditingMode && !profilePicFile && !user?.profile_pic) {
      addToast('error', 'Profile Picture Required', 'Please upload a profile picture to complete your profile.'); setLoading(false); return;
    }
    if (!formData.age || formData.age < 18 || formData.age > 100 ) {
        addToast('error', 'Invalid Age', 'Please enter a valid age between 18 and 100.'); setLoading(false); return;
    }
    if (formData.preferences.ageRange.min === '' || formData.preferences.ageRange.max === '' || 
        parseInt(formData.preferences.ageRange.min) >= parseInt(formData.preferences.ageRange.max) || 
        parseInt(formData.preferences.ageRange.min) < 18 || parseInt(formData.preferences.ageRange.max) > 100) {
      addToast('error', 'Invalid Age Preference', 'Please set a valid preferred age range (18-100, min < max).'); setLoading(false); return;
    }
    try {
      let finalProfilePicPath = user?.profile_pic;
      if (profilePicFile) {
        const picFormData = new FormData(); picFormData.append('profile_pic', profilePicFile);
        const picRes = await apiClient.post('/upload-profile-pic', picFormData);
        finalProfilePicPath = picRes.data.profile_pic;
      }
      const payload = { ...formData, age: Number(formData.age), preferences: { ...formData.preferences, ageRange: { min: Number(formData.preferences.ageRange.min), max: Number(formData.preferences.ageRange.max) } } , profile_pic: finalProfilePicPath };
      
      const response = await apiClient.post('/complete-profile', payload);
      updateUserContext(response.data.user);
      addToast('success', `Profile ${isEditingMode ? 'Updated' : 'Completed'}!`, 'Your information is saved.');
      navigate(isEditingMode ? '/profile' : '/discover'); // Navigate to discover after completion
    } catch (err) { addToast('error', 'Update Failed', err.response?.data?.message || 'Could not update profile.'); }
    finally { setLoading(false); }
  };

  if (!user) return <FullPageSpinner message="Loading profile editor..."/>;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }}>
          <Card className="card-custom">
            <Card.Header as="h3" className="text-center card-header-custom d-flex align-items-center justify-content-center">
              {isEditingMode ? <><FaUserEdit className="me-2"/>Edit Your Profile</> : <><BsStars className="me-2"/>Complete Your Profile</>}
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row className="align-items-center mb-4">
                  <Col md={4} className="text-center mb-3 mb-md-0">
                    <motion.div whileHover={{ scale: 1.05 }} style={{cursor:'pointer'}} onClick={() => picInputRef.current?.click()}>
                      <Image src={profilePicPreview} roundedCircle style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid var(--primary-color)' }} className="mb-2 shadow-sm"/>
                      <div style={{color: 'var(--primary-color)', fontWeight:'500'}}><FaEdit className="me-1" /> Change Picture</div>
                    </motion.div>
                    <Form.Control type="file" ref={picInputRef} accept="image/jpeg,image/png,image/gif,image/jpg" onChange={handleProfilePicChange} className="d-none" />
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Bio (max 300 characters)</Form.Label><Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} maxLength={300} placeholder="A few words about yourself..." /></Form.Group>
                  </Col>
                </Row>
                <hr className="my-4"/>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label><FaBirthdayCake className="me-1"/> Age</Form.Label><Form.Control type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="100" required placeholder="e.g. 25"/></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label><FaVenusMars className="me-1"/> Your Gender</Form.Label><Form.Select name="gender" value={formData.gender} onChange={handleChange}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></Form.Select></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Interests (max 10)</Form.Label>
                  <InputGroup><Form.Control type="text" placeholder="Type an interest and press Add" value={currentInterest} onChange={(e) => setCurrentInterest(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInterestAdd())} /><Button variant="outline-primary" onClick={handleInterestAdd}>Add</Button></InputGroup>
                  <div className="d-flex flex-wrap mt-2" style={{gap: '0.5rem'}}>{formData.interests.map(i => <Badge pill bg="primary-soft" text="primary" key={i} className="p-2 fs-6 d-flex align-items-center" style={{backgroundColor: 'rgba(37,99,235,0.1)', color:'var(--primary-color)', cursor:'pointer', fontWeight:'500'}} onClick={() => handleInterestRemove(i)}>{i} <BsXCircle className="ms-2"/></Badge>)}</div>
                </Form.Group>
                {!isEditingMode && <Form.Group className="mb-4"><Form.Label><FaMapMarkerAlt className="me-1"/> Enable Location (Optional)</Form.Label><Button variant="outline-secondary" className="w-100" onClick={handleUpdateLocation} disabled={locationLoading}>{locationLoading ? <Spinner size="sm"/> : <><BsGeoAltFill className="me-1"/> Use My Current Location</>}</Button><Form.Text className="text-muted d-block mt-1">This helps in finding nearby matches. We only store your general area.</Form.Text></Form.Group>}
                {isEditingMode && user?.location?.coordinates && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0) && 
                 <Form.Group className="mb-4"><Form.Label><FaMapMarkerAlt className="me-1"/> Update Location</Form.Label><Button variant="outline-secondary" className="w-100" onClick={handleUpdateLocation} disabled={locationLoading}>{locationLoading ? <Spinner size="sm"/> : <><BsGeoAltFill className="me-1"/> Update My Current Location</>}</Button><Form.Text className="text-muted d-block mt-1">Your location is currently active.</Form.Text></Form.Group>
                }
                <hr className="my-4"/>
                <h4 className="mt-3 mb-3 text-center" style={{color:'var(--text-primary)'}}>Matching Preferences</h4>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Show me profiles of</Form.Label><Form.Select name="gender" value={formData.preferences.gender} onChange={(e) => handlePrefChange(e, 'gender')}><option value="Any">Any Gender</option><option value="Male">Men</option><option value="Female">Women</option></Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Label>Preferred Age Range</Form.Label><InputGroup><Form.Control type="number" name="min" placeholder="Min Age" value={formData.preferences.ageRange.min} onChange={(e) => handlePrefChange(e, 'ageRange')} min="18" max="99" required/><InputGroup.Text>-</InputGroup.Text><Form.Control type="number" name="max" placeholder="Max Age" value={formData.preferences.ageRange.max} onChange={(e) => handlePrefChange(e, 'ageRange')} min={(formData.preferences.ageRange.min || 18)+1} max="100" required/></InputGroup></Col>
                </Row>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-4">
                <Button variant="primary" type="submit" className="w-100 py-2 fs-5 fw-medium" disabled={loading}>{loading ? <Spinner size="sm"/> : (isEditingMode ? 'Save Changes' : 'Complete Profile & Discover!')}</Button>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};
const CompleteProfilePage = () => <ProfileFormPage isEditingMode={false} />;
const EditProfilePage = () => <ProfileFormPage isEditingMode={true} />;

const ProfileViewPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    if (!user) return <FullPageSpinner message="Loading your profile..."/>;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'S')}&background=2563EB&color=fff&size=150&bold=true&rounded=true`;

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <motion.div initial={{ opacity: 0, scale:0.95 }} animate={{ opacity: 1, scale:1 }} transition={{duration:0.3, ease:"easeOut"}}>
                    <Card className="card-custom">
                        <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
                            <h3 className="mb-0">Your Profile</h3>
                            <Button variant="light" size="sm" onClick={() => navigate('/profile/edit')} style={{backgroundColor: 'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.5)', fontWeight:'500'}}>
                                <FaUserEdit className="me-1" /> Edit
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row>
                                <Col md={4} className="text-center mb-4 mb-md-0">
                                    <Image src={user.profile_pic ? `${user.profile_pic}` : defaultAvatar} 
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid var(--primary-color)', borderRadius:'50%' }} className="mb-3 shadow"/>
                                    <h4 className="mt-2" style={{color:'var(--text-primary)'}}>{user.name}</h4>
                                    <p className="text-muted">{user.email}</p>
                                </Col>
                                <Col md={8}>
                                    <h5 style={{color:'var(--primary-color)'}}><BsPersonCircle className="me-2"/>About Me</h5>
                                    <p className="text-muted" style={{whiteSpace: 'pre-wrap', fontSize:'0.95rem'}}>{user.bio || "No bio provided. Add a few words to attract more matches!"}</p>
                                    <hr/>
                                    <Row>
                                        <Col sm={6}><p><strong><FaBirthdayCake className="me-1 text-primary"/>Age:</strong> {user.age || 'N/A'}</p></Col>
                                        <Col sm={6}><p><strong><FaVenusMars className="me-1 text-primary"/>Gender:</strong> {user.gender || 'N/A'}</p></Col>
                                    </Row>
                                    <p><strong><BsHeart className="me-1 text-primary"/>Interests:</strong>
                                        {user.interests?.length > 0 ? user.interests.map(i => <Badge pill style={{backgroundColor: 'rgba(37,99,235,0.1)', color:'var(--primary-color)', fontWeight:'500'}} className="me-1 mb-1 p-2" key={i}>{i}</Badge>) : " No interests added."}
                                    </p>
                                </Col>
                            </Row>
                            <hr className="my-4"/>
                            <h5 className="mt-3" style={{color:'var(--primary-color)'}}><BsGearFill className="me-2"/>Matching Preferences</h5>
                            <Row>
                                <Col sm={6}><p><strong>Show me:</strong> {user.preferences?.gender || 'Any'}</p></Col>
                                <Col sm={6}><p><strong>Age Range:</strong> {user.preferences?.ageRange?.min || '18'} - {user.preferences?.ageRange?.max || '100'}</p></Col>
                            </Row>
                             {user.location?.coordinates && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0) ? 
                             <p><FaMapMarkerAlt className="me-1 text-primary"/><strong>Location:</strong> Your location is active for matching.</p> :
                             <p><FaMapMarkerAlt className="me-1 text-muted"/><strong>Location:</strong> Not set. <Link to="/profile/edit" style={{color:'var(--primary-color)'}}>Add location</Link> to find nearby matches.</p>
                             }
                        </Card.Body>
                    </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
};

const HomePage = () => {
  const { user } = useAuth();
  if (!user) return <FullPageSpinner message="Loading SoulSync..."/>;
  return (
    <Container className="text-center py-5 d-flex flex-column justify-content-center align-items-center flex-grow-1">
      <motion.div initial={{ opacity: 0, y: 20, scale:0.9 }} animate={{ opacity: 1, y: 0, scale:1 }} transition={{ delay: 0.2, type:'spring', stiffness:120 }}>
        <motion.div initial={{rotateY:0}} animate={{rotateY:360}} transition={{duration:1.5, ease:'easeInOut', repeat:Infinity, repeatDelay:3}}>
            <BsHeartFill size={80} style={{color: 'var(--accent-color)'}} className="mb-4"/>
        </motion.div>
        <h1 style={{color: 'var(--text-primary)', fontWeight:'bold'}}>Welcome back, <span style={{color: 'var(--primary-color)'}}>{user.name}</span>!</h1>
        {user.isProfileComplete ? (
          <>
            <p className="lead mt-3" style={{color: 'var(--text-secondary)'}}>Ready to find your SoulSync?</p>
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(37, 99, 235, 0.3)" }} whileTap={{ scale: 0.95 }}>
            <Button as={Link} to="/discover" variant="primary" size="lg" className="mt-4 shadow-lg py-3 px-5 fs-5 rounded-pill">
              Start Discovering <BsStars className="ms-2"/>
            </Button>
            </motion.div>
          </>
        ) : (
          <>
            <p className="lead mt-3 text-warning fw-medium">Your profile isn't complete yet.</p>
            <Alert variant='info' className="mt-3 shadow-sm d-flex align-items-center"><BsInfoCircleFill className="me-2"/>Complete your profile to start discovering and matching!</Alert>
            <motion.div whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(22, 163, 74, 0.3)" }} whileTap={{ scale: 0.95 }}>
            <Button as={Link} to="/complete-profile" variant="success" size="lg" className="mt-3 shadow-lg py-3 px-5 fs-5 rounded-pill">
              Complete Your Profile <FaUserEdit className="ms-2"/>
            </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </Container>
  );
};

const UserCard = ({ user: discoveredUser }) => {
  const defaultPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(discoveredUser.name || 'S')}&size=600&background=random&color=fff&font-size=0.33&bold=true&rounded=true`;
  const profilePicUrl = discoveredUser.profile_pic ? `${discoveredUser.profile_pic}` : defaultPic;
  
  return (
    <div className="position-relative w-100 card-custom discover-card">
      <Image src={profilePicUrl} className="discover-card-img" />
      <div className="discover-card-content-overlay">
          <h3 className="card-title mb-1">{discoveredUser.name}, {discoveredUser.age}</h3>
          <p className="card-subtitle mb-2 fs-6">{discoveredUser.gender}</p>
          {discoveredUser.bio && <p className="card-text mb-2" style={{maxHeight: '60px', overflow:'hidden', fontSize:'0.9rem'}}>{discoveredUser.bio.substring(0,90)}{discoveredUser.bio.length > 90 ? '...' : ''}</p>}
          {discoveredUser.interests?.length > 0 && (
            <div className="mb-0 d-flex flex-wrap" style={{gap: '0.4rem'}}>
              {discoveredUser.interests.slice(0, 3).map(i => <Badge key={i}>{i}</Badge>)}
              {discoveredUser.interests.length > 3 && <Badge>+{discoveredUser.interests.length - 3} more</Badge>}
            </div>
          )}
      </div>
    </div>
  );
};

const DiscoverPage = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInteracting, setIsInteracting] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUserData, setMatchedUserData] = useState(null);
  const [matchIdForChat, setMatchIdForChat] = useState(null);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = async (isRetry = false) => {
    if (!isRetry) setLoading(true); setError('');
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => { try { await apiClient.post('/update-location', { latitude: pos.coords.latitude, longitude: pos.coords.longitude }); } catch (e) { console.warn("Silent loc update failed during fetch", e); } },
          (err) => console.warn("Geo perm denied for silent update during fetch", err), { timeout: 3000, enableHighAccuracy: false, maximumAge: 300000 }
        );
      }
      const response = await apiClient.get('/discover');
      if (response.data && response.data.length > 0) {
        setUsers(response.data);
        setCurrentIndex(0);
      } else if (!isRetry) { // If initial load and no users, show message.
         setUsers([]);
         setError("No new profiles found right now. Try adjusting your preferences!");
      } else if (isRetry && response.data && response.data.length === 0) {
        // if retry and still no new users, don't clear old ones if any. just inform
        addToast('info', 'No More Users', "You've seen everyone for now!");
      }

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not load new profiles.';
      setError(errMsg); 
      if (!isRetry) { setUsers([]); addToast('error', 'Discovery Failed', errMsg); }
    } finally { if (!isRetry) setLoading(false); }
  };

  useEffect(() => { if (currentUser?.isProfileComplete) fetchUsers(); }, [currentUser?.isProfileComplete]);


  const handleSwipe = async (action, swipedUser) => { // Pass swipedUser directly
    if (isInteracting || !swipedUser) return;
    
    setIsInteracting(true);

    // Animate out the card visually THEN update state
    // The actual removal/index change is handled by onDragEnd's state update for currentIndex

    try {
      if (action === 'like') {
        const res = await apiClient.post(`/like/${swipedUser._id}`);
        if (res.data.isMatch) {
          setMatchedUserData(swipedUser);
          setMatchIdForChat(res.data.matchId);
          setShowMatchModal(true);
        }
      }
    } catch (err) { addToast('error', 'Action Failed', err.response?.data?.message || 'Could not perform action.'); }
    finally {
      setIsInteracting(false);
      // setCurrentIndex might be called by onDragEnd or button click, let that handle it
      if (currentIndex + 1 >= users.length - 1) { // Fetch more if we are near the end
          fetchUsers(true);
      }
    }
  };
  
  const [dragX, setDragX] = useState(0);
  const cardVariants = {
    center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
    exitLeft: { x: -300, opacity: 0, scale: 0.8, rotate: -15, transition:{duration:0.3, ease:"easeIn"} },
    exitRight: { x: 300, opacity: 0, scale: 0.8, rotate: 15, transition:{duration:0.3, ease:"easeIn"} },
  };

  const handleDragEnd = (event, info) => {
    setDragX(0);
    const swipedUser = users[currentIndex];
    if (!swipedUser) return;

    if (info.offset.x > 100) {
      handleSwipe('like', swipedUser);
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.x < -100) {
      handleSwipe('pass', swipedUser);
      setCurrentIndex(prev => prev + 1);
    }
    // If not swiped far enough, it will snap back.
  };

  const handleButtonAction = (action) => {
    const swipedUser = users[currentIndex];
    if (!swipedUser || isInteracting) return;

    // Trigger visual exit for button clicks
    setDragX(action === 'like' ? 150 : -150); 
    
    // After a short delay for animation to start, handle logic and advance card
    setTimeout(() => {
        handleSwipe(action, swipedUser);
        setCurrentIndex(prev => prev + 1);
        setDragX(0); // Reset for next card after animation
    }, 100); // Adjust delay as needed for animation feel
  };


  if (loading) return <FullPageSpinner message="Finding potential matches..." />;

  const currentVisibleUser = users[currentIndex];

  return (
    <Container fluid className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-3 position-relative" style={{overflow:'hidden'}}>
      {error && !currentVisibleUser && <Alert variant="warning" className="text-center shadow-sm">{error} <Button size="sm" variant="link" onClick={() => fetchUsers(false)}>Try again</Button></Alert>}
      
      <div className="position-relative" style={{ height: '75vh', maxHeight: '600px', width:'100%', maxWidth:'380px', marginBottom:'1rem'}}>
        <AnimatePresence initial={false}>
          {currentVisibleUser && (
            <motion.div
              key={currentVisibleUser._id}
              custom={dragX}
              variants={cardVariants}
              initial="center"
              animate="center"
              exit={dragX > 0 ? "exitRight" : (dragX < 0 ? "exitLeft" : undefined) } // Only apply exit if dragX is set
              drag="x"
              dragConstraints={{ left: 0, right: 0, top:0, bottom:0 }}
              dragElastic={0.7}
              onDrag={(event, info) => setDragX(info.offset.x)}
              onDragEnd={handleDragEnd}
              className="position-absolute w-100 h-100"
              style={{ transformStyle: "preserve-3d", cursor:'grab' }}
              whileTap={{cursor:'grabbing'}}
            >
              <UserCard user={currentVisibleUser} />
                <motion.div style={{ position: 'absolute', top: '50%', left: '20px', fontSize: '3rem', color: 'var(--pass-color)', opacity: Math.max(0, -dragX / 100 - 0.2), pointerEvents:'none', transform:'translateY(-50%) rotate(-15deg)' }}><BsXCircleFill /></motion.div>
                <motion.div style={{ position: 'absolute', top: '50%', right: '20px', fontSize: '3rem', color: 'var(--accent-color)', opacity: Math.max(0, dragX / 100 - 0.2), pointerEvents:'none', transform:'translateY(-50%) rotate(15deg)' }}><BsHeartFill /></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!currentVisibleUser && !loading && !error && (
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center p-5 rounded-3 shadow-sm bg-white card-custom">
            <BsStars size={60} className="mb-3" style={{color: 'var(--primary-color)'}}/>
            <h4 style={{color:'var(--text-primary)'}}>That's Everyone For Now!</h4>
            <p style={{color:'var(--text-secondary)'}}>You've seen all available profiles based on your preferences. Check back later or adjust your settings!</p>
            <Button onClick={() => fetchUsers(false)} variant="outline-primary" className="rounded-pill px-4">Refresh Discoveries</Button>
          </motion.div>
      )}

      {currentVisibleUser && (
         <div className="discover-actions">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="danger" className="btn-pass" onClick={() => handleButtonAction('pass')} disabled={isInteracting}>
                <BsXCircleFill />
            </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="success" className="btn-like" onClick={() => handleButtonAction('like')} disabled={isInteracting}>
                <BsHeartFill />
            </Button>
            </motion.div>
        </div>
      )}

      <Modal show={showMatchModal} onHide={() => setShowMatchModal(false)} centered contentClassName="card-custom border-0" backdrop="static">
         <Modal.Body className="text-center p-4">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 150, delay:0.1 }}>
            <BsStars size={50} className="mb-3" style={{color: 'var(--accent-color)'}}/>
            <h2 style={{color: 'var(--accent-color)'}} className="mb-3 fw-bold">It's a SoulSync!</h2>
            <div className="d-flex justify-content-center align-items-center my-4">
              <Image src={currentUser?.profile_pic ? `${currentUser.profile_pic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'M')}&rounded=true&background=random`} roundedCircle style={{width: 100, height: 100, objectFit: 'cover', border: `4px solid var(--accent-color)`}} className="shadow-lg"/>
              <BsHeartFill style={{color: 'var(--accent-color)'}} className="mx-3 display-4"/>
              <Image src={matchedUserData?.profile_pic ? `${matchedUserData.profile_pic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUserData?.name || 'Y')}&rounded=true&background=random`} roundedCircle style={{width: 100, height: 100, objectFit: 'cover', border: `4px solid var(--accent-color)`}} className="shadow-lg"/>
            </div>
            <h4 style={{color:'var(--text-primary)'}}>You and {matchedUserData?.name} are now connected!</h4>
            <p style={{color:'var(--text-secondary)'}}>Don't be shy, send a message and get to know each other.</p>
          </motion.div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pb-4">
          <Button variant="outline-secondary" onClick={() => setShowMatchModal(false)} className="me-2 rounded-pill px-4 py-2">Keep Exploring</Button>
          <Button variant="primary" onClick={() => { setShowMatchModal(false); navigate(`/chat/${matchIdForChat}`);}} className="rounded-pill px-4 py-2 btn-accent">
            <BsChatDots className="me-1"/> Send a Message
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const MatchListItem = ({ match, currentUserId }) => {
    const navigate = useNavigate();
    const otherUser = match.user1._id === currentUserId ? match.user2 : match.user1;
    if (!otherUser) return null;

    const defaultPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || 'S')}&background=2563EB&color=fff&size=55&bold=true&rounded=true`;
    const profilePicUrl = otherUser.profile_pic ? `${otherUser.profile_pic}` : defaultPic;

    return (
        <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.1, type:'spring', stiffness:150}} whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.05)", transition:{duration:0.1} }}>
            <ListGroup.Item action onClick={() => navigate(`/chat/${match._id}`)} className="d-flex align-items-center p-3 border-bottom-0" style={{borderTop:'1px solid var(--border-color)', cursor:'pointer'}}>
                <Image src={profilePicUrl} 
                style={{ width: '55px', height: '55px', objectFit: 'cover', marginRight: '15px', border:'2px solid var(--border-color)', borderRadius:'50%' }} />
                <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold" style={{color:'var(--text-primary)'}}>{otherUser.name}</h6>
                    <small className="d-block text-truncate" style={{color:'var(--text-secondary)', maxWidth: '200px', fontSize:'0.85rem'}}>
                        {match.lastMessage ? match.lastMessage : "No messages yet. Say hi!"}
                    </small>
                </div>
                {match.lastMessageAt && <small className="text-muted ms-2 text-nowrap" style={{fontSize:'0.75rem'}}>{new Date(match.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}
            </ListGroup.Item>
        </motion.div>
    );
};

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const socket = useSocket();

  const fetchMatches = React.useCallback(async () => { // Wrapped in useCallback
    setLoading(true);
    try {
      const response = await apiClient.get('/matches');
      setMatches(response.data);
    } catch (err) { addToast('error', 'Load Failed', 'Could not fetch your matches.'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]); // addToast is stable, apiClient is stable

  useEffect(() => { if(user?._id) fetchMatches(); }, [user?._id, fetchMatches]);
  
  useEffect(() => {
    if (socket) {
      const handler = (data) => { 
        console.log("MatchesPage: Socket event received", data.matchId || data.match);
        // Only refetch if relevant to this user's matches (e.g. new match or message in existing match)
        if (data.matchId && matches.find(m => m._id === data.matchId)) {
          fetchMatches(); // Message in an existing match
        } else if (data.match && (data.user1 === user._id || data.user2 === user._id)) { // Simplified new match check
            fetchMatches(); // New match involving current user
        } else if (data._id && matches.find(m => m._id === data.match)) { // If msg has match ID
            fetchMatches();
        } else { // Fallback for generic newMatch if more specific data isn't available
            const isNewMatchForUser = (data.matchedUser && data.matchId); // Typical structure for newMatch event
            if(isNewMatchForUser) fetchMatches();
        }
      };
      socket.on('newMatch', handler); 
      socket.on('receiveMessage', handler); // Covers new messages
      return () => { 
        socket.off('newMatch', handler); 
        socket.off('receiveMessage', handler);
      };
    }
  }, [socket, addToast, fetchMatches, matches, user?._id]); // Added matches and user._id to deps for handler logic

  if (loading) return <FullPageSpinner message="Loading conversations..." />;

  return (
    <Container className="py-4">
      <motion.h2 initial={{opacity:0, y:-20}} animate={{opacity:1,y:0}} className="mb-4 fw-bold" style={{color:'var(--primary-color)'}}>Your Conversations</motion.h2>
      {matches.length > 0 ? (
        <ListGroup variant="flush" className="card-custom p-0">
          {matches.map(match => <MatchListItem key={match._id} match={match} currentUserId={user._id} />)}
        </ListGroup>
      ) : (
        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center py-5 card-custom bg-white p-5">
          <BsChatDots size={70} className="mb-4" style={{color:'var(--primary-color)'}}/>
          <h4 style={{color:'var(--text-primary)'}}>No Conversations Yet</h4>
          <p style={{color:'var(--text-secondary)'}}>It's a bit quiet here. Head to Discover to find new connections!</p>
          <Button as={Link} to="/discover" variant="primary" className="rounded-pill px-4 py-2 mt-3">
            <BsStars className="me-1"/> Find Matches
          </Button>
        </motion.div>
      )}
    </Container>
  );
};

const MessageBubble = ({ message, isSender, senderProfilePic, receiverProfilePic }) => {
  const profilePic = isSender ? senderProfilePic : receiverProfilePic;
  const timestamp = message.timestamp || message.createdAt;
  
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 15, x: isSender ? 10 : -10 }} animate={{ opacity: 1, y: 0, x:0 }} 
      transition={{ type:"spring", stiffness:200, damping:20 }}
      className={`d-flex mb-3 ${isSender ? 'justify-content-end' : 'justify-content-start'}`}
    >
      <div className={`d-flex ${isSender ? 'flex-row-reverse' : 'flex-row'} align-items-end`} style={{maxWidth: '75%'}}>
      {!isSender && profilePic && <Image src={profilePic} roundedCircle style={{width: '30px', height: '30px', objectFit:'cover', marginRight: '8px', alignSelf:'flex-end'}}/>}
      <div className={`p-2 px-3 shadow-sm message-bubble ${isSender ? 'sender' : 'receiver'} ${message.isOptimistic ? 'opacity-75' : ''}`}>
        <div style={{whiteSpace: "pre-wrap"}}>{message.content}</div>
        <div className={`mt-1 ${isSender ? 'text-light opacity-75 text-end' : 'text-muted text-start'}`} style={{fontSize: '0.7rem'}}>
          {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : (message.isOptimistic ? 'Sending...' : '')}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

const ChatPage = () => {
  const { matchId } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const scrollToBottom = (behavior = "auto") => { // Changed to auto for initial load
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
    }
  };
  
  useEffect(() => { 
    if(messages.length) scrollToBottom(messages.length > 1 ? "smooth" : "auto"); 
  }, [messages]);

  useEffect(() => {
    if (!currentUser?._id || !matchId) return;
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch specific match details first, then messages.
        // Or, modify /matches to also return the specific match if ID is provided.
        // For now, assuming /matches returns all and we find it.
        const allMatchesRes = await apiClient.get('/matches'); 
        if (!isMounted) return;
        const currentM = allMatchesRes.data.find(m => m._id === matchId);
        
        if (!currentM) {
          addToast('error', "Match Not Found", "This chat does not exist or you're not part of it."); 
          navigate("/matches", {replace: true}); return;
        }
        // Check if current user is part of this match
        if (currentM.user1._id !== currentUser._id && currentM.user2._id !== currentUser._id) {
           addToast('error', "Access Denied", "You are not authorized to view this chat."); 
           navigate("/matches", {replace: true}); return;
        }

        setMatchDetails(currentM);
        setOtherUser(currentM.user1._id === currentUser._id ? currentM.user2 : currentM.user1);
        
        const messagesRes = await apiClient.get(`/messages/${matchId}`);
        if (isMounted) setMessages(messagesRes.data);

      } catch (err) { 
          if (isMounted) {
            addToast('error', "Load Failed", err.response?.data?.message || "Could not load chat data."); 
            navigate("/matches", {replace: true});
          }
      }
      finally { if (isMounted) setLoading(false); }
    };
    fetchData();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentUser?._id, navigate, addToast]); // Removed apiClient from deps as it's stable

  useEffect(() => {
    if (socket && currentUser?._id && otherUser?._id && matchId) {
      const messageHandler = (msgFromServer) => {
        // console.log(`[User: ${currentUser.name}, Chat: ${matchId}] Received 'receiveMessage':`, JSON.parse(JSON.stringify(msgFromServer)));

        if (msgFromServer.match === matchId) {
          setMessages(prevMessages => {
            const alreadyConfirmedIndex = prevMessages.findIndex(m => m._id && m._id === msgFromServer._id && !m.isOptimistic);
            if (alreadyConfirmedIndex > -1) return prevMessages;

            if (msgFromServer.sender && msgFromServer.sender._id === currentUser._id) {
              let replacedOptimistic = false;
              const updatedMessages = prevMessages.map(m => {
                if (m.isOptimistic && m.sender._id === msgFromServer.sender._id && m.content === msgFromServer.content) {
                  replacedOptimistic = true;
                  return { ...msgFromServer, isOptimistic: false };
                }
                return m;
              });
              return replacedOptimistic ? updatedMessages : [...prevMessages.filter(m => m._id !== msgFromServer._id), { ...msgFromServer, isOptimistic: false }]; // Add if not replaced, ensure no duplicates
            } else {
              return [...prevMessages.filter(m => m._id !== msgFromServer._id), { ...msgFromServer, isOptimistic: false }]; // Add from other user, ensure no duplicates
            }
          });
        }
      };

      socket.on('receiveMessage', messageHandler);
      return () => { socket.off('receiveMessage', messageHandler); };
    }
  }, [socket, currentUser?._id, otherUser?._id, matchId]);


  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); // Make 'e' optional
    if (!newMessage.trim() || !otherUser?._id || !currentUser?._id || sending || !socket) {
        if(!socket) addToast('error', 'Not Connected', 'Cannot send message, not connected to chat server.');
        if(!currentUser) addToast('error', 'User Error', 'Current user data is missing.');
        return;
    }
    setSending(true);
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const currentMsgContent = newMessage.trim();

    const optimisticMessage = {
        _id: tempId,
        tempId: tempId,
        sender: { // Sender as an object
            _id: currentUser._id,
            name: currentUser.name,
            profile_pic: currentUser.profile_pic
        },
        receiver: otherUser._id, // Receiver can be just ID for socket emission
        content: currentMsgContent,
        timestamp: new Date().toISOString(),
        match: matchId,
        isOptimistic: true
    };
    setMessages(prev => [...prev, optimisticMessage]); 
    setNewMessage('');
    if (chatInputRef.current) {
      chatInputRef.current.focus();
      chatInputRef.current.style.height = 'auto'; // Reset height
    }

    try {
      socket.emit('sendMessage', { senderId: currentUser._id, receiverId: otherUser._id, content: currentMsgContent, matchId });
    } catch (err) {
      console.error("Socket emit sendMessage error:", err);
      addToast('error', "Send Failed", "Message could not be sent via socket. Please try again.");
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally { setSending(false); }
  };

  if (loading) return <FullPageSpinner message="Loading your conversation..." />;
  if (!matchDetails || !otherUser || !currentUser) return ( // Added !currentUser check
    <Container className="text-center py-5">
      <Alert variant="warning">Chat details are incomplete. Redirecting...</Alert>
      {setTimeout(() => navigate("/matches", {replace: true}), 100)} {/* Redirect after a tick */}
    </Container>
  );

  const defaultPic = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'S')}&background=random&color=fff&size=40&bold=true&rounded=true`;
  const currentUserPic = currentUser.profile_pic ? `${currentUser.profile_pic}` : defaultPic(currentUser.name);
  const otherUserPic = otherUser.profile_pic ? `${otherUser.profile_pic}` : defaultPic(otherUser.name);

  return (
    <div className="chat-page-container">
      <BootstrapNavbar bg="light" className="shadow-sm border-bottom fixed-top" style={{top: 'var(--navbar-height, 68px)', zIndex:1000}}>
        <Container fluid className="px-3 d-flex align-items-center">
          <Button variant="link" onClick={() => navigate('/matches')} className="text-decoration-none p-0 me-2 fs-4" style={{color:'var(--text-secondary)'}}><BsArrowLeft /></Button>
          <Image src={otherUserPic} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius:'50%' }} className="me-2"/>
          <BootstrapNavbar.Text className="fw-bold" style={{color:'var(--text-primary)'}}>{otherUser.name}</BootstrapNavbar.Text>
        </Container>
      </BootstrapNavbar>

      <div className="chat-message-area"> {/* Removed pt-5, padding handled by .chat-page-container */}
        <AnimatePresence initial={false}>
        {messages.map(msg => (
          <MessageBubble key={msg._id || msg.tempId} message={msg} 
            isSender={msg.sender._id === currentUser._id} // Simplified: msg.sender is now always an object
            senderProfilePic={currentUserPic} receiverProfilePic={otherUserPic}
          />
        ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <Form onSubmit={handleSendMessage} className="p-2 chat-input-form d-flex align-items-center">
        <Form.Control ref={chatInputRef} as="textarea" rows={1} placeholder={`Message ${otherUser.name}...`} value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`; }}
          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} // Pass no event to avoid issues
          style={{ resize: 'none', maxHeight: '100px', overflowY: 'auto' }} className="me-2" disabled={sending}
        />
        <motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
        <Button type="submit" className="rounded-circle p-0 d-flex align-items-center justify-content-center chat-send-btn" style={{width: '45px', height: '45px'}} disabled={!newMessage.trim() || sending}>
          {sending ? <Spinner size="sm" variant="light"/> : <BsSendFill size={18} color="white"/>}
        </Button>
        </motion.div>
      </Form>
    </div>
  );
};

const NotFoundPage = () => (
  <Container className="text-center py-5 d-flex flex-column justify-content-center align-items-center flex-grow-1">
    <motion.div initial={{ opacity: 0, y:50, scale:0.8 }} animate={{ opacity: 1, y:0, scale:1 }} transition={{type:'spring', stiffness:100}}>
        <BsExclamationTriangleFill size={80} className="mb-4" style={{color:'var(--primary-color)'}} />
        <h1 className="display-1 fw-bold" style={{color:'var(--primary-color)'}}>404</h1>
        <h2 style={{color:'var(--text-primary)'}}>Oops! Lost in Love?</h2>
        <p className="lead" style={{color:'var(--text-secondary)'}}>The page you're looking for couldn't be found. Let's get you back on track.</p>
        <Button as={Link} to="/" variant="primary" size="lg" className="mt-4 rounded-pill px-5 py-2">
            Back to SoulSync Home
        </Button>
    </motion.div>
  </Container>
);


// --- New Component to wrap Routes and useLocation ---
const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={<ProtectedContent><AnimatedPage><HomePage /></AnimatedPage></ProtectedContent>} />
        <Route path="/discover" element={<ProtectedContent><AnimatedPage className="p-0"><DiscoverPage /></AnimatedPage></ProtectedContent>} />
        <Route path="/matches" element={<ProtectedContent><AnimatedPage><MatchesPage /></AnimatedPage></ProtectedContent>} />
        <Route path="/chat/:matchId" element={<ProtectedContent><ChatPage /></ProtectedContent>} />
        <Route path="/profile" element={<ProtectedContent><AnimatedPage><ProfileViewPage /></AnimatedPage></ProtectedContent>} />
        <Route path="/profile/edit" element={<ProtectedContent><AnimatedPage><EditProfilePage /></AnimatedPage></ProtectedContent>} />
        <Route path="/complete-profile" element={<ProtectedContent><AnimatedPage><CompleteProfilePage /></AnimatedPage></ProtectedContent>} />
        
        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

// --- Main App Component ---
function App() {
  useEffect(() => { // Set CSS variable for navbar height
    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
      document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }
  }, []);

  return (
    <>
      <GlobalStyles />
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppNavbar />
            <SocketProvider>
              <AppRoutes />
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </>
  );
}

export default App;