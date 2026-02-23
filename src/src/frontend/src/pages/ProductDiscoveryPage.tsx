import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllProducts } from '../hooks/useQueries';
import { Product, ProductCategory } from '../backend';
import { CATEGORY_LABELS, formatPrice } from '@/lib/helpers';
import { AnimatedCard, SeedGrowthLoader } from '../components/AnimatedComponents';

interface ProductDiscoveryPageProps {
  navigate: (page: any, params?: any) => void;
}

export default function ProductDiscoveryPage({ navigate }: ProductDiscoveryPageProps) {
  const { data: products = [], isLoading } = useGetAllProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesOrganic = !organicOnly || product.organic;
    const isAvailable = product.available && product.quantity > 0;

    return matchesSearch && matchesCategory && matchesOrganic && isAvailable;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-8">Explore Fresh Produce</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as ProductCategory | 'all')}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(ProductCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={organicOnly ? 'default' : 'outline'}
            onClick={() => setOrganicOnly(!organicOnly)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {organicOnly ? '🌱 Organic Only' : 'All Products'}
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <SeedGrowthLoader />
            <p className="ml-4 text-muted-foreground">Loading fresh produce...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No products found</p>
            <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id.toString()} product={product} index={index} navigate={navigate} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProductCard({ product, index, navigate }: { product: Product; index: number; navigate: any }) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (product.imageBlob) {
      setImageUrl(product.imageBlob.getDirectURL());
    }
  }, [product.imageBlob]);

  return (
    <AnimatedCard
      delay={index * 0.05}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={() => navigate('detail', { productId: product.id })}
    >
      <Card className="cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
        {imageUrl ? (
          <div className="relative h-48 bg-muted overflow-hidden">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            {product.organic && (
              <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                🌱
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}

        <CardHeader>
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          <Badge variant="outline" className="w-fit mt-1">{CATEGORY_LABELS[product.category]}</Badge>
        </CardHeader>

        <CardContent>
          <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {product.quantity.toString()} {product.unit} available
          </p>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
