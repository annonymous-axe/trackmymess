import React, { useState } from 'react';
import { useAuth } from '@/App';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Utensils, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Users, 
  Sandwich, 
  Calendar, 
  PauseCircle, 
  CreditCard, 
  FileText, 
  Building2, 
  Users2, 
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const superAdminLinks = [
    { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { to: '/super-admin/clients', label: 'Clients', icon: Building2, color: 'text-purple-600' },
    { to: '/super-admin/reports', label: 'Platform Reports', icon: BarChart3, color: 'text-green-600' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { to: '/admin/customers', label: 'Customers', icon: Users, color: 'text-purple-600' },
    { to: '/admin/staff', label: 'Staff', icon: Users2, color: 'text-pink-600' },
    { to: '/admin/meal-plans', label: 'Meal Plans', icon: Sandwich, color: 'text-orange-600' },
    { to: '/admin/attendance', label: 'Attendance', icon: Calendar, color: 'text-green-600' },
    { to: '/admin/pause-requests', label: 'Pause Requests', icon: PauseCircle, color: 'text-yellow-600' },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard, color: 'text-emerald-600' },
    { to: '/admin/invoices', label: 'Invoices', icon: FileText, color: 'text-indigo-600' },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3, color: 'text-cyan-600' },
  ];

  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Bar */}
      <header className="glass-strong sticky top-0 z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                data-testid="sidebar-toggle"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient" data-testid="app-title">TrackMyMess</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Mess Management SaaS</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-lg" data-testid="user-menu-trigger">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm">
                    <span className="font-medium">{user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer" data-testid="logout-button">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 glass-strong border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-16 lg:mt-0
          `}
        >
          <nav className="p-4 space-y-2 h-full overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <div
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'gradient-primary text-white shadow-lg scale-105' 
                        : 'hover:bg-gray-100 text-gray-700 hover:scale-102'
                      }
                    `}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : link.color}`} />
                    </div>
                    <span className="flex-1 font-medium text-sm">{link.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </div>
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-700 mb-1">Need Help?</p>
              <p className="text-xs text-gray-600 mb-2">Check our documentation</p>
              <Button size="sm" variant="outline" className="w-full text-xs">
                View Docs
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Breadcrumb & Title */}
          {title && (
            <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-700 font-medium">{title}</span>
              </div>
              <h2 className="text-3xl font-bold text-gradient" data-testid="page-title">
                {title}
              </h2>
            </div>
          )}
          
          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
