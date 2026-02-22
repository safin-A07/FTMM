import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiCalendar, FiUser, FiLogOut, FiBell, FiMenu, FiX, FiShield } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { to: '/dashboard', icon: <FiHome />, label: 'Home' },
        { to: '/matches', icon: <FiCalendar />, label: 'Matches' },
        { to: '/profile', icon: <FiUser />, label: 'Profile' },
        ...(user?.role === 'admin' ? [{ to: '/admin', icon: <FiShield />, label: 'Admin' }] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-dark items-center justify-between px-8 py-4 border-b border-white/5">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <span className="text-2xl font-display font-bold neon-text">⚽ TURF</span>
                    <span className="text-2xl font-display font-bold text-white">MGR</span>
                </Link>
                <div className="flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                    ? 'neon-text border-b-2 border-[#39FF14] pb-1'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {link.icon} {link.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        Hey, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <FiLogOut /> Logout
                    </button>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/5 px-2 py-2 safe-area-pb">
                <div className="flex items-center justify-around">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive(link.to)
                                    ? 'text-[#39FF14]'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className={`text-xl ${isActive(link.to) ? 'neon-glow rounded-full p-1 bg-[#39FF14]/10' : ''}`}>
                                {link.icon}
                            </span>
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <span className="text-xl"><FiLogOut /></span>
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
