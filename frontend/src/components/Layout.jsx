import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Search,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications] = useState(3);
  const [scrolled, setScrolled] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const superAdminLinks = [
    { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/super-admin/clients', label: 'Clients', icon: Building2 },
    { to: '/super-admin/reports', label: 'Platform Reports', icon: BarChart3 },
    { to: '/super-admin/settings/pricing', label: 'Pricing Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/staff', label: 'Staff', icon: Users2 },
    { to: '/admin/meal-plans', label: 'Meal Plans', icon: Sandwich, badge: 'New' },
    { to: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { to: '/admin/pause-requests', label: 'Pause Requests', icon: PauseCircle, badge: '2' },
    { to: '/admin/payments', label: 'Payments & Invoices', icon: CreditCard },
    { to: '/admin/subscription', label: 'Subscription', icon: Sparkles },
    // { to: '/admin/billing', label: 'Plan & Billing', icon: CreditCard },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Top Header */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 
          transition-all duration-300
          ${scrolled 
            ? 'glass-strong shadow-md' 
            : 'bg-background/80 backdrop-blur-md'
          }
          border-b border-border
        `}
      >
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left Section - Logo & Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-primary/10 lg:hidden"
                data-testid="sidebar-toggle"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to={isSuperAdmin ? '/super-admin' : '/admin'} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold" data-testid="app-title">
                  TrackMyMess
                </span>
              </Link>
            </div>

            {/* Center Section - Search (Desktop) */}
            {/* <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent border-none outline-none pl-9 pr-3 py-1.5 text-sm"
                />
              </div>
            </div> */}

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-primary/10"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-1.5 rounded-lg hover:bg-primary/10">
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[var(--color-danger-500)] rounded-full"></span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="flex items-center justify-between text-sm">
                    <span>Notifications</span>
                    <span className="text-xs text-muted-foreground">{notifications} new</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-2.5">
                      <span className="text-xs font-medium">New pause request</span>
                      <span className="text-xs text-muted-foreground">John Doe requested a pause</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-2.5">
                      <span className="text-xs font-medium">Payment received</span>
                      <span className="text-xs text-muted-foreground">₹5,000 from Customer #1234</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="gap-1.5 rounded-lg px-2 hover:bg-primary/10 h-9" 
                    data-testid="user-menu-trigger"
                  >
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium leading-none">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-muted-foreground leading-none mt-0.5">
                        {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <User className="w-3.5 h-3.5 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-xs text-[var(--color-danger-600)] dark:text-[var(--color-danger-400)] cursor-pointer font-medium"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted/50 rounded-lg border border-border pl-9 pr-3 py-1.5 text-sm outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <div className="flex h-screen pt-14">
        {/* Compact Sidebar - Fixed & Non-scrollable */}
        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-40
            w-64 bg-card/50 backdrop-blur-xl border-r border-border
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-14 lg:pt-0
            flex-shrink-0
          `}
        >
          <nav className="h-[calc(100vh-3.5rem)] lg:h-full overflow-hidden p-3 space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link key={link.to} to={link.to}>
                  <div
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                      transition-all duration-200
                      ${isActive
                        ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)] font-medium border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)] shadow-sm'
                        : 'hover:bg-muted text-foreground'
                      }
                    `}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge && !isActive && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-danger-500)] text-white">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-background">
          {/* Compact Page Header */}
          {title && (
            <div className="bg-background border-b border-border px-4 lg:px-6 py-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <Link 
                  to={isSuperAdmin ? '/super-admin' : '/admin'} 
                  className="hover:text-foreground transition-colors"
                >
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{title}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-foreground" data-testid="page-title">
                {title}
              </h2>
            </div>
          )}
          
          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
