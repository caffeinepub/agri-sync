import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { CartProvider } from './contexts/CartContext';
import { useTranslation } from 'react-i18next';

// Components
import OnboardingFlow from './pages/OnboardingFlow';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDiscoveryPage from './pages/ProductDiscoveryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import { ScrollToTopButton } from './components/NavigationControls';

// Simple router state
type Page = 'onboarding' | 'home' | 'listing' | 'discovery' | 'detail' | 'cart' | 'orders' | 'profile' | 'admin' | 'adminLogin';

interface RouteState {
  page: Page;
  params?: any;
}

function AppContent() {
  const { t } = useTranslation();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const [route, setRoute] = useState<RouteState>({ page: 'home' });
  const [navigationHistory, setNavigationHistory] = useState<RouteState[]>([{ page: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('hasSeenOnboarding') === 'true';
  });

  const isAuthenticated = !!identity;

  // Show profile setup modal
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Navigate function with history tracking
  const navigate = (page: Page, params?: any) => {
    const newRoute = { page, params };
    setRoute(newRoute);
    
    // Add to history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(newRoute);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back navigation
  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setRoute(navigationHistory[newIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Forward navigation
  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setRoute(navigationHistory[newIndex]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;

  // Show onboarding for first-time users
  useEffect(() => {
    if (!isInitializing && !isAuthenticated && !hasSeenOnboarding) {
      setRoute({ page: 'onboarding' });
    }
  }, [isInitializing, isAuthenticated, hasSeenOnboarding]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    navigate('home');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-bounce">🌱</div>
          <p className="text-lg text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  // Route rendering
  const renderPage = () => {
    switch (route.page) {
      case 'onboarding':
        return <OnboardingFlow onComplete={handleCompleteOnboarding} />;
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'listing':
        return <ProductListingPage navigate={navigate} />;
      case 'discovery':
        return <ProductDiscoveryPage navigate={navigate} />;
      case 'detail':
        return <ProductDetailPage navigate={navigate} productId={route.params?.productId} />;
      case 'cart':
        return <CartPage navigate={navigate} />;
      case 'orders':
        return <OrdersPage navigate={navigate} />;
      case 'profile':
        return <ProfilePage navigate={navigate} />;
      case 'adminLogin':
        return <AdminLoginPage navigate={navigate} />;
      case 'admin':
        return <AdminDashboard navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <>
      {renderPage()}
      {showProfileSetup && <ProfileSetupModal />}
      <ScrollToTopButton />
      <Toaster position="top-center" />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}
