import { motion } from 'framer-motion';
import { Search, Plus, Leaf, Milk, Package, Apple, Wheat, Sprout as SproutIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { UserRole, ProductCategory } from '../backend';
import { AnimatedCard, FloatingElement, StaggeredList, StaggeredItem } from '../components/AnimatedComponents';
import { CATEGORY_LABELS, CATEGORY_TRANSLATION_KEYS } from '@/lib/helpers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HomePageProps {
  navigate: (page: any, params?: any) => void;
}

export default function HomePage({ navigate }: HomePageProps) {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!identity;
  const isFarmer = userProfile?.role === UserRole.farmer;
  const isBuyer = userProfile?.role === UserRole.homeBuyer || userProfile?.role === UserRole.businessBuyer;

  const categories = [
    { category: ProductCategory.fruits, icon: Apple, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    { category: ProductCategory.vegetables, icon: Leaf, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    { category: ProductCategory.grains, icon: Wheat, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
    { category: ProductCategory.dairy, icon: Milk, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { category: ProductCategory.organicFood, icon: SproutIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { category: ProductCategory.others, icon: Package, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('discovery', { search: searchQuery });
    } else {
      navigate('discovery');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1">
        {/* Hero Section with Living Background */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
          {/* Floating decorative elements */}
          <FloatingElement className="absolute top-20 left-10 text-primary/10" duration={8}>
            <Leaf className="w-32 h-32" />
          </FloatingElement>
          <FloatingElement className="absolute top-40 right-20 text-accent/10" duration={10} yOffset={15}>
            <SproutIcon className="w-40 h-40" />
          </FloatingElement>
          <FloatingElement className="absolute bottom-20 left-1/3 text-secondary/10" duration={12}>
            <Apple className="w-28 h-28" />
          </FloatingElement>

          <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.65, 0.0, 0.35, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {t('hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12">
                {t('hero.subtitle')}
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex gap-3 max-w-xl mx-auto mb-8"
              >
                <Input
                  type="text"
                  placeholder={t('hero.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 text-lg rounded-full px-6 bg-card border-2 border-border focus:border-primary"
                />
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                {!isAuthenticated && (
                  <p className="w-full text-muted-foreground">{t('hero.loginPrompt')}</p>
                )}

                {isFarmer && (
                  <Button
                    onClick={() => navigate('listing')}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('hero.addProduct')}
                  </Button>
                )}

                {isBuyer && (
                  <Button
                    onClick={() => navigate('discovery')}
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8"
                  >
                    {t('hero.exploreProduce')}
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-center mb-12"
          >
            {t('categories.title')}
          </motion.h2>

          <StaggeredList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <StaggeredItem key={cat.category}>
                  <AnimatedCard
                    delay={index * 0.1}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('discovery', { category: cat.category })}
                    className={`cursor-pointer p-6 rounded-3xl ${cat.color} border-2 border-transparent hover:border-current transition-all text-center`}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-medium text-sm">{t(CATEGORY_TRANSLATION_KEYS[cat.category])}</p>
                  </AnimatedCard>
                </StaggeredItem>
              );
            })}
          </StaggeredList>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-display font-bold text-center mb-12"
            >
              Why Choose AGRI-SYNC?
            </motion.h2>

            <StaggeredList className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🌱',
                  title: 'Fresh & Organic',
                  description: 'Direct from farms, no middlemen. Get the freshest produce delivered to your door.',
                },
                {
                  icon: '🤝',
                  title: 'Fair Trade',
                  description: 'Farmers get fair prices. Buyers get quality products. Everyone wins.',
                },
                {
                  icon: '🌍',
                  title: 'Sustainable',
                  description: 'Support local farmers and reduce carbon footprint with locally-sourced food.',
                },
              ].map((feature, index) => (
                <StaggeredItem key={index}>
                  <OrganicFeatureCard {...feature} />
                </StaggeredItem>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Stats Section (if authenticated) */}
        {isAuthenticated && (
          <section className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedCard className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-3xl text-center">
                <p className="text-5xl font-bold text-primary mb-2">500+</p>
                <p className="text-muted-foreground">Active Farmers</p>
              </AnimatedCard>

              <AnimatedCard delay={0.1} className="bg-gradient-to-br from-secondary/20 to-secondary/5 p-8 rounded-3xl text-center">
                <p className="text-5xl font-bold text-secondary mb-2">2000+</p>
                <p className="text-muted-foreground">Happy Buyers</p>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className="bg-gradient-to-br from-accent/20 to-accent/5 p-8 rounded-3xl text-center">
                <p className="text-5xl font-bold text-accent mb-2">10K+</p>
                <p className="text-muted-foreground">Fresh Products</p>
              </AnimatedCard>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function OrganicFeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-card rounded-3xl p-8 shadow-lg border border-border hover:border-primary/50 transition-all"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
