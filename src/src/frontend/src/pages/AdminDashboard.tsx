import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetPlatformAnalytics, useGetAllUsers, useGetAllProducts, useGetAllOrders } from '../hooks/useQueries';
import { formatPrice } from '@/lib/helpers';
import { SeedGrowthLoader } from '../components/AnimatedComponents';

interface AdminDashboardProps {
  navigate: (page: any, params?: any) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformAnalytics();
  const { data: users = [] } = useGetAllUsers();
  const { data: products = [] } = useGetAllProducts();
  const { data: orders = [] } = useGetAllOrders();

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SeedGrowthLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics?.totalUsers.toString() || '0'}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Users}
            label="Farmers"
            value={analytics?.totalFarmers.toString() || '0'}
            color="bg-success/10 text-success"
          />
          <StatCard
            icon={Package}
            label="Products"
            value={analytics?.totalProducts.toString() || '0'}
            color="bg-accent/10 text-accent"
          />
          <StatCard
            icon={ShoppingCart}
            label="Orders"
            value={analytics?.totalOrders.toString() || '0'}
            color="bg-secondary/10 text-secondary"
          />
        </div>

        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/20 to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Total Platform Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">
                {formatPrice(analytics?.totalRevenue || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyer Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Home Buyers:</span>
                <span className="font-bold">{analytics?.totalHomeBuyers.toString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Buyers:</span>
                <span className="font-bold">{analytics?.totalBusinessBuyers.toString() || '0'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Products:</span>
                <span className="font-bold">{products.filter(p => p.available).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recent Orders:</span>
                <span className="font-bold">{orders.slice(0, 10).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
