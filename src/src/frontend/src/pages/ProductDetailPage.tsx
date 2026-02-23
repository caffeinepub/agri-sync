import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBasket, Minus, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useGetProduct } from '../hooks/useQueries';
import { useCart } from '../contexts/CartContext';
import { CATEGORY_LABELS, UNIT_LABELS, formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { SeedGrowthLoader } from '../components/AnimatedComponents';

interface ProductDetailPageProps {
  navigate: (page: any, params?: any) => void;
  productId: bigint;
}

export default function ProductDetailPage({ navigate, productId }: ProductDetailPageProps) {
  const { data: product, isLoading } = useGetProduct(productId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (product?.imageBlob) {
      setImageUrl(product.imageBlob.getDirectURL());
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`Added ${quantity} ${UNIT_LABELS[product.unit]} to cart! 🛒`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SeedGrowthLoader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">Product not found</p>
            <Button onClick={() => navigate('discovery')}>Back to Products</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('discovery')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden"
          >
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-[500px] object-cover" />
            ) : (
              <div className="w-full h-[500px] bg-gradient-to-br from-primary/30 to-secondary/30" />
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline">{CATEGORY_LABELS[product.category]}</Badge>
                {product.organic && <Badge className="bg-success text-success-foreground">🌱 Organic</Badge>}
              </div>
              <h1 className="text-4xl font-display font-bold mb-4">{product.name}</h1>
              <p className="text-xl text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <p className="text-5xl font-bold text-primary mb-2">{formatPrice(product.price)}</p>
              <p className="text-muted-foreground">per {UNIT_LABELS[product.unit]}</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Stock Available:</span>
                  <span className="text-lg">{product.quantity.toString()} {UNIT_LABELS[product.unit]}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(Number(product.quantity), quantity + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!product.available || product.quantity === BigInt(0)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-full"
                >
                  <ShoppingBasket className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
