import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton, ScrollToTopButton } from '../components/NavigationControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetUserOrders, useGetFarmerOrders, useUpdateOrderStatus } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { UserRole, OrderStatus, Order } from '../backend';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/helpers';
import { toast } from 'sonner';
import { SeedGrowthLoader } from '../components/AnimatedComponents';

interface OrdersPageProps {
  navigate: (page: any, params?: any) => void;
}

export default function OrdersPage({ navigate }: OrdersPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const isFarmer = userProfile?.role === UserRole.farmer;

  const { data: userOrders = [], isLoading: userOrdersLoading } = useGetUserOrders();
  const { data: farmerOrders = [], isLoading: farmerOrdersLoading } = useGetFarmerOrders();

  const orders = isFarmer ? farmerOrders : userOrders;
  const isLoading = isFarmer ? farmerOrdersLoading : userOrdersLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <BackButton onClick={() => navigate('home')} label="Back to Home" className="mb-6" />
        <h1 className="text-4xl font-display font-bold mb-8">
          {isFarmer ? 'Incoming Orders' : 'My Orders'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <SeedGrowthLoader />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold mb-3">No Orders Yet</h2>
            <p className="text-muted-foreground mb-8">
              {isFarmer ? 'Orders will appear here when buyers place them' : 'Start shopping to see your orders here'}
            </p>
            {!isFarmer && (
              <Button onClick={() => navigate('discovery')} className="bg-primary hover:bg-primary/90">
                Explore Products
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <OrderCard key={order.id.toString()} order={order} index={index} isFarmer={isFarmer} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function OrderCard({ order, index, isFarmer }: { order: Order; index: number; isFarmer: boolean }) {
  const updateOrderStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
            <Badge className={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Items:</span>
              <span>{order.items.length} product(s)</span>
            </div>

            {isFarmer && order.status === OrderStatus.pending && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleStatusUpdate(OrderStatus.accepted)}
                  className="flex-1 bg-success hover:bg-success/90"
                  disabled={updateOrderStatus.isPending}
                >
                  Accept Order
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(OrderStatus.cancelled)}
                  variant="destructive"
                  className="flex-1"
                  disabled={updateOrderStatus.isPending}
                >
                  Reject
                </Button>
              </div>
            )}

            {isFarmer && order.status === OrderStatus.accepted && (
              <Button
                onClick={() => handleStatusUpdate(OrderStatus.fulfilled)}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={updateOrderStatus.isPending}
              >
                Mark as Fulfilled
              </Button>
            )}

            {isFarmer && order.status === OrderStatus.fulfilled && (
              <Button
                onClick={() => handleStatusUpdate(OrderStatus.delivered)}
                className="w-full bg-success hover:bg-success/90"
                disabled={updateOrderStatus.isPending}
              >
                Mark as Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
