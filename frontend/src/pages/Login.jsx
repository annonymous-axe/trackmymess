import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md glass-strong scale-in relative z-10" data-testid="login-card">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
            <Utensils className="w-10 h-10 text-white" />
          </div>
          
          {/* Title & Description */}
          <div>
            <CardTitle className="text-4xl mb-2 font-bold" style={{ fontFamily: 'var(--font-family-heading)' }}>
              <span className="text-gradient">TrackMyMess</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to your mess management dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground" data-testid="email-label">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  data-testid="email-input"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground" data-testid="password-label">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  data-testid="password-input"
                />
              </div>
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              Demo Credentials
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-card/50 rounded">
                <span className="text-muted-foreground">Super Admin:</span>
                <code className="font-mono font-semibold text-foreground">superadmin / Admin@123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-card/50 rounded">
                <span className="text-muted-foreground">Client Admin:</span>
                <code className="font-mono font-semibold text-foreground">admin-1-2-3 / Password@123</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        <p>© 2025 TrackMyMess. All rights reserved.</p>
      </div>
    </div>
  );
}
