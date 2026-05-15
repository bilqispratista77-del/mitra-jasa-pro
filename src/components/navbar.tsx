'use client';

import { useAuthStore } from '@/store/auth-store';
import { useNavStore, type PageName } from '@/store/nav-store';
import { useAuthModal } from '@/components/auth-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems: { label: string; page: PageName }[] = [
  { label: 'Beranda', page: 'beranda' },
  { label: 'Jasa', page: 'jasa' },
  { label: 'Artikel', page: 'artikel' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { currentPage, navigate } = useNavStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { openLogin, openRegisterSelect } = useAuthModal();
  const openRegister = openRegisterSelect;

  const handleLogout = async () => {
    await logout();
    navigate('beranda');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = (page: PageName) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo-mjp.png"
            alt="Mitra Jasa Pro"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="gradient-text text-xl font-bold">Mitra Jasa Pro</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-dodger bg-dodger/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-dodger" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 gap-2 rounded-full px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={() => navigate('dashboard')}>
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('admin')}>
                    <Shield className="size-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={openLogin}>
                Masuk
              </Button>
              <Button size="sm" onClick={openRegister}>
                Daftar
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-dodger bg-dodger/5'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-dodger" />
                  )}
                </button>
              );
            })}
            <div className="my-2 border-t" />
            {isAuthenticated && user ? (
              <>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => { navigate('dashboard'); setMobileMenuOpen(false); }}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => { navigate('admin'); setMobileMenuOpen(false); }}
                  >
                    <Shield className="size-4" />
                    Admin Panel
                  </button>
                )}
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="size-4" />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { openLogin(); setMobileMenuOpen(false); }}>
                  Masuk
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { openRegister(); setMobileMenuOpen(false); }}>
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
