import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, DollarSign, ArrowLeftRight, FileBarChart, ScrollText, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: 'לוח בקרה', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'פרויקטים / תב"רים', icon: FolderOpen },
  { to: '/loans', label: 'הלוואות בין פרויקטים', icon: ArrowLeftRight },
  { to: '/reports', label: 'דוחות וייצוא', icon: FileBarChart },
  { to: '/audit', label: 'יומן פעולות', icon: ScrollText },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-blue-900 text-white z-30
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:relative md:translate-x-0 md:z-auto
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div>
            <div className="font-bold text-lg">GrantBoard</div>
            <div className="text-xs text-blue-300">מערכת ניהול תקציב מענקים</div>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-blue-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 right-0 left-0 px-4">
          <div className="bg-blue-800 rounded-lg p-3 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>מנהל מערכת</span>
            </div>
            <div className="mt-1 text-blue-200 font-medium">ישראל ישראלי</div>
          </div>
        </div>
      </aside>
    </>
  );
}
