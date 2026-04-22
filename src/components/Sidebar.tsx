import { LucideIcon, LayoutDashboard, Database, CloudRain, ChartCandlestick, ShoppingBag, Wallet, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';

interface NavItem {
    name: string;
    icon: LucideIcon;
    path: string;
}

const mainNav: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Live Trading', icon: ChartCandlestick, path: '/live-trading' },
    { name: 'Spot Trading', icon: ChartCandlestick, path: '/crypto-trading' },
];

const miningNav: NavItem[] = [
    { name: 'Pool Mining', icon: Database, path: '/pool-mining' },
    { name: 'Cloud Mining', icon: CloudRain, path: '/cloud-mining' },
    { name: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
];

const userNav: NavItem[] = [
    { name: 'Wallet', icon: Wallet, path: '/wallet' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const renderNavGroup = (title: string, items: NavItem[]) => (
        <div className="mb-6">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 px-3">{title}</h3>
            <div className="flex flex-col gap-1">
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                                isActive 
                                    ? 'bg-[#0052ff]/10 text-[#0052ff] shadow-[inset_4px_0_0_0_#0052ff] dark:shadow-[inset_4px_0_0_0_#00f0ff] dark:text-[#00f0ff] dark:bg-[#00f0ff]/10' 
                                    : 'text-secondary hover:bg-subtle hover:text-primary'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.name}
                    </NavLink>
                ))}
            </div>
        </div>
    );

    return (
        <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0 scrollbar-hide overflow-y-auto">
            <div className="p-6 pb-2">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Operations Hub</div>
            </div>
            
            <nav className="flex-1 p-4">
                {renderNavGroup('Trading', mainNav)}
                {renderNavGroup('Mining', miningNav)}
                {renderNavGroup('Account', userNav)}
                
                {isAdmin && renderNavGroup('Admin', [
                    { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                    { name: 'Admin Settings', icon: SettingsIcon, path: '/admin/settings' },
                ])}
            </nav>

            <div className="p-4 border-t border-border">
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 p-3 rounded-xl transition-all font-medium text-red-500 hover:bg-red-500/10"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
