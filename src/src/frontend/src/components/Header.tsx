import { motion } from 'framer-motion';
import { Sprout, ShoppingBasket, Package, User, LayoutDashboard, Sun, Moon, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useCart } from '../contexts/CartContext';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '../backend';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface HeaderProps {
  navigate: (page: any, params?: any) => void;
}

export default function Header({ navigate }: HeaderProps) {
  const { t } = useTranslation();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { getTotalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAdminAuth();

  const isAuthenticated = !!identity;
  const cartCount = getTotalItems();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success(t('messages.success.logout'));
    navigate('home');
  };

  const handleAdminLogout = () => {
    adminLogout();
    toast.success(t('messages.success.logout'));
    navigate('home');
  };

  const isFarmer = userProfile?.role === UserRole.farmer;
  const isBuyer = userProfile?.role === UserRole.homeBuyer || userProfile?.role === UserRole.businessBuyer;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-2xl font-display font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sprout className="w-8 h-8" />
            <span className="hidden sm:inline">{t('app.name')}</span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('home')}
                  className="text-foreground hover:text-primary"
                >
                  {t('nav.home')}
                </Button>

                {isFarmer && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('listing')}
                    className="text-foreground hover:text-primary"
                  >
                    {t('nav.myProducts')}
                  </Button>
                )}

                {isBuyer && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('discovery')}
                    className="text-foreground hover:text-primary"
                  >
                    {t('nav.explore')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => navigate('orders')}
                  className="text-foreground hover:text-primary"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t('nav.orders')}
                </Button>

                {isBuyer && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('cart')}
                    className="relative text-foreground hover:text-primary"
                  >
                    <ShoppingBasket className="w-4 h-4 mr-2" />
                    {t('nav.cart')}
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground px-2 py-0.5 text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('admin')}
                    className="text-foreground hover:text-primary"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t('nav.admin')}
                  </Button>
                )}

                {isAdminAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={handleAdminLogout}
                    className="text-foreground hover:text-primary"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t('admin.adminLogin')} - {t('nav.logout')}
                  </Button>
                )}

                {!isAuthenticated && !isAdminAuthenticated && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('adminLogin')}
                    className="text-foreground hover:text-primary"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t('admin.adminLogin')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => navigate('profile')}
                  className="text-foreground hover:text-primary"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </Button>
              </>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleLogout}>
                {t('nav.logout')}
              </Button>
            ) : (
              <Button
                onClick={login}
                disabled={loginStatus === 'logging-in'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loginStatus === 'logging-in' ? t('nav.connecting') : t('nav.login')}
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isBuyer && cartCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('cart')}
                className="relative"
              >
                <ShoppingBasket className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground px-1.5 py-0.5 text-xs">
                  {cartCount}
                </Badge>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 space-y-2"
          >
            {isAuthenticated && userProfile && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  {t('nav.home')}
                </Button>

                {isFarmer && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('listing');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    {t('nav.myProducts')}
                  </Button>
                )}

                {isBuyer && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('discovery');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      {t('nav.explore')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('cart');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <ShoppingBasket className="w-4 h-4 mr-2" />
                      {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('orders');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t('nav.orders')}
                </Button>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t('nav.admin')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </Button>
              </>
            )}

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1">
                <LanguageSwitcher />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {isAuthenticated ? (
                <Button variant="outline" onClick={handleLogout} className="flex-1">
                  {t('nav.logout')}
                </Button>
              ) : (
                <Button
                  onClick={login}
                  disabled={loginStatus === 'logging-in'}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {loginStatus === 'logging-in' ? t('nav.connecting') : t('nav.login')}
                </Button>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
