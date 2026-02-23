import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBasket, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '../contexts/CartContext';
import { usePlaceOrder } from '../hooks/useQueries';
import { formatPrice, UNIT_LABELS } from '@/lib/helpers';
import { toast } from 'sonner';
import { OrderItem } from '../backend';

interface CartPageProps {
  navigate: (page: any, params?: any) => void;
}

export default function CartPage({ navigate }: CartPageProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const placeOrder = usePlaceOrder();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Group items by farmer
    const itemsByFarmer = items.reduce((acc, item) => {
      const farmerKey = item.product.farmer.toString();
      if (!acc[farmerKey]) acc[farmerKey] = [];
      acc[farmerKey].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    try {
      // Place orders for each farmer
      for (const [farmerKey, farmerItems] of Object.entries(itemsByFarmer)) {
        const orderItems: OrderItem[] = farmerItems.map((item) => ({
          productId: item.product.id,
          quantity: BigInt(item.quantity),
          price: item.product.price,
        }));

        await placeOrder.mutateAsync({
          items: orderItems,
          farmer: farmerItems[0].product.farmer,
        });
      }

      toast.success('Order placed successfully! 🎉');
      clearCart();
      navigate('orders');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header navigate={navigate} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBasket className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
            <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8">Add some fresh produce to get started!</p>
            <Button onClick={() => navigate('discovery')} className="bg-primary hover:bg-primary/90">
              Explore Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-8">Your Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <CartItemCard
                key={item.product.id.toString()}
                item={item}
                index={index}
                onRemove={() => removeItem(item.product.id)}
                onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={placeOrder.isPending}
                className="w-full bg-primary hover:bg-primary/90 h-12 rounded-full"
              >
                {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CartItemCard({
  item,
  index,
  onRemove,
  onUpdateQuantity,
}: {
  item: any;
  index: number;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (item.product.imageBlob) {
      setImageUrl(item.product.imageBlob.getDirectURL());
    }
  }, [item.product.imageBlob]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-4 flex gap-4">
        {imageUrl && (
          <img src={imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
        )}
        
        <div className="flex-1">
          <h3 className="font-bold text-lg">{item.product.name}</h3>
          <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)} / {UNIT_LABELS[item.product.unit]}</p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <p className="font-bold text-primary ml-auto">{formatPrice(item.product.price * item.quantity)}</p>

            <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
