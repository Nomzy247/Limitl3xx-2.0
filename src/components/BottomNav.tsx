import { Link } from 'react-router';
import { Wallet, Activity, User, Home } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex justify-between items-center z-50">
      <Link to="/" className="flex flex-col items-center gap-1 text-secondary hover:text-[#00f0ff] transition-colors">
        <Home size={20} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/dashboard" className="flex flex-col items-center gap-1 text-secondary hover:text-[#00f0ff] transition-colors">
        <Activity size={20} />
        <span className="text-[10px] font-medium">Earn</span>
      </Link>
      <Link to="/wallet" className="flex flex-col items-center gap-1 text-secondary hover:text-[#00f0ff] transition-colors">
        <Wallet size={20} />
        <span className="text-[10px] font-medium">Wallet</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1 text-secondary hover:text-[#00f0ff] transition-colors">
        <User size={20} />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </div>
  );
}
