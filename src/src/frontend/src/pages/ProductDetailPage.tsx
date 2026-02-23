import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBasket, Minus, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton, ScrollToTopButton } from '../components/NavigationControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetProduct, useGetAllProducts } from '../hooks/useQueries';
import { useCart } from '../contexts/CartContext';
import { useProductSuggestions } from '../hooks/useProductSuggestions';
import { useRestrictions } from '../hooks/useRestrictions';
import { useDiscounts } from '../hooks/useDiscounts';
import { CATEGORY_LABELS, UNIT_LABELS, formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { SeedGrowthLoader, AnimatedCard, StaggeredList, StaggeredItem } from '../components/AnimatedComponents';
import { Product } from '../backend';
import { useTranslation } from 'react-i18next';

interface ProductDetailPageProps {
  navigate: (page: any, params?: any) => void;
  productId: bigint;
}

export default function ProductDetailPage({ navigate, productId }: ProductDetailPageProps) {
  const { t } = useTranslation();
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: allProducts = [] } = useGetAllProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');

  const { trackProductView, getSimilarProducts } = useProductSuggestions(allProducts);
  const { checkProductRestriction } = useRestrictions();
  const { getDiscountForProduct } = useDiscounts();

  const restriction = product ? checkProductRestriction(product) : { isRestricted: false };
  const discount = product ? getDiscountForProduct(product) : null;
  const similarProducts = product ? getSimilarProducts(product, 4) : [];

  // Track product view
  useEffect(() => {
    if (product) {
      trackProductView(product.id);
    }
  }, [product, trackProductView]);

  useEffect(() => {
    if (product?.imageBlob) {
      setImageUrl(product.imageBlob.getDirectURL());
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      if (restriction.isRestricted) {
        toast.error(`${t('restrictions.productRestricted')}: ${restriction.reason}`);
        return;
      }
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
        <BackButton onClick={() => navigate('discovery')} label="Back to Products" className="mb-6" />

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
                  {restriction.isRestricted && (
                    <Badge variant="destructive">{t('restrictions.productRestricted')}</Badge>
                  )}
                  {discount && (
                    <Badge className="bg-accent text-accent-foreground">
                      {discount.isPercentage ? `${discount.value}% ${t('discounts.off')}` : `₹${discount.value} ${t('discounts.off')}`}
                    </Badge>
                  )}
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
                  disabled={!product.available || product.quantity === BigInt(0) || restriction.isRestricted}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-full"
                >
                  <ShoppingBasket className="w-5 h-5 mr-2" />
                  {restriction.isRestricted ? t('restrictions.productRestricted') : 'Add to Cart'}
                </Button>
                {restriction.isRestricted && (
                  <p className="text-sm text-destructive text-center mt-2">{restriction.reason}</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-display font-bold mb-8">{t('suggestions.youMightAlsoLike')}</h2>
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct, index) => (
                <StaggeredItem key={similarProduct.id.toString()}>
                  <SimilarProductCard product={similarProduct} index={index} navigate={navigate} />
                </StaggeredItem>
              ))}
            </StaggeredList>
          </section>
        )}
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function SimilarProductCard({ product, index, navigate }: { product: Product; index: number; navigate: any }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (product.imageBlob) {
      setImageUrl(product.imageBlob.getDirectURL());
    }
  }, [product.imageBlob]);

  return (
    <AnimatedCard
      delay={index * 0.1}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={() => navigate('detail', { productId: product.id })}
    >
      <Card className="cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
        {imageUrl ? (
          <div className="relative h-40 bg-muted overflow-hidden">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            {product.organic && (
              <Badge className="absolute top-2 right-2 bg-success text-success-foreground">🌱</Badge>
            )}
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {product.quantity.toString()} {product.unit} available
          </p>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
