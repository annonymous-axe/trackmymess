import React from 'react';
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
import { Utensils, LogOut, User, LayoutDashboard, Users, Sandwich, Calendar, PauseCircle, CreditCard, FileText, Building2, Users2, BarChart3 } from 'lucide-react';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const superAdminLinks = [
    { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/super-admin/clients', label: 'Clients', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/staff', label: 'Staff', icon: Users2 },
    { to: '/admin/meal-plans', label: 'Meal Plans', icon: Sandwich },
    { to: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { to: '/admin/pause-requests', label: 'Pause Requests', icon: PauseCircle },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/invoices', label: 'Invoices', icon: FileText },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }} data-testid="app-title">TrackMyMess</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="user-menu-trigger">
                <User className="w-4 h-4" />
                {user?.full_name || user?.username}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">
                <span className="font-medium">{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm text-gray-600">
                Role: {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer" data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 glass border-r border-white/30 p-4">
          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-2 ${isActive ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}`}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {title && (
            <div className="mb-6">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }} data-testid="page-title">{title}</h2>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
