import { motion } from 'framer-motion';
import { Product } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBasket, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StaggeredList, StaggeredItem } from './AnimatedComponents';

interface ProductSuggestionsProps {
  products: Product[];
  title: string;
  onProductClick: (productId: bigint) => void;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
}

export default function ProductSuggestions({
  products,
  title,
  onProductClick,
  onAddToCart,
  showAddToCart = false,
}: ProductSuggestionsProps) {
  const { t } = useTranslation();

  if (products.length === 0) return null;

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          {title}
        </h2>
      </motion.div>

      <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product) => (
          <StaggeredItem key={product.id.toString()}>
            <Card
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden h-full"
              onClick={() => onProductClick(product.id)}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                {product.imageBlob ? (
                  <img
                    src={product.imageBlob.getDirectURL()}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <span className="text-6xl">🌱</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                  {product.organic && (
                    <Badge className="bg-green-500 text-white">
                      {t('discovery.organic')}
                    </Badge>
                  )}
                  {!product.available && (
                    <Badge variant="secondary">
                      {t('product.outOfStock')}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {t('common.rupees')}{product.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      /{product.unit}
                    </span>
                  </div>

                  {showAddToCart && onAddToCart && product.available && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="gap-2"
                    >
                      <ShoppingBasket className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('product.addToCart')}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </StaggeredItem>
        ))}
      </StaggeredList>
    </section>
  );
}
