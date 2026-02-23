import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProductsByFarmer, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useQueries';
import { Product, ProductCategory, ProductUnit, ExternalBlob } from '../backend';
import { CATEGORY_LABELS, UNIT_LABELS, formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { AnimatedCard, SeedGrowthLoader } from '../components/AnimatedComponents';

interface ProductListingPageProps {
  navigate: (page: any, params?: any) => void;
}

export default function ProductListingPage({ navigate }: ProductListingPageProps) {
  const { identity } = useInternetIdentity();
  const { data: products = [], isLoading } = useGetProductsByFarmer(identity?.getPrincipal() || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">Manage your farm products and listings</p>
          </div>
          <Button
            onClick={handleAddProduct}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Plant a Product
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <SeedGrowthLoader />
            <p className="ml-4 text-muted-foreground">Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState onAddProduct={handleAddProduct} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                index={index}
                onEdit={handleEditProduct}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* Product Form Dialog */}
        {isFormOpen && (
          <ProductFormDialog
            product={editingProduct}
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

function EmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <Package className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
      <h2 className="text-2xl font-bold mb-3 text-foreground">No Products Yet</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start by adding your first product. Share what you grow with buyers waiting for fresh produce!
      </p>
      <Button
        onClick={onAddProduct}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Your First Product
      </Button>
    </motion.div>
  );
}

function ProductCard({
  product,
  index,
  onEdit,
  navigate,
}: {
  product: Product;
  index: number;
  onEdit: (product: Product) => void;
  navigate: (page: any, params?: any) => void;
}) {
  const deleteProduct = useDeleteProduct();
  const [imageUrl, setImageUrl] = useState<string>('');

  // Load image
  useState(() => {
    if (product.imageBlob) {
      const url = product.imageBlob.getDirectURL();
      setImageUrl(url);
    }
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(product.id);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <AnimatedCard delay={index * 0.1}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
        <div onClick={() => navigate('detail', { productId: product.id })}>
          {imageUrl ? (
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.organic && (
                <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                  🌱 Organic
                </Badge>
              )}
              {!product.available && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                  Out of Stock
                </Badge>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{product.name}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              <Badge variant="outline">{CATEGORY_LABELS[product.category]}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Stock: {product.quantity.toString()} {UNIT_LABELS[product.unit]}</span>
              <span className={product.available ? 'text-success' : 'text-destructive'}>
                {product.available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex-1 text-destructive hover:text-destructive"
                disabled={deleteProduct.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

function ProductFormDialog({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || ProductCategory.vegetables);
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [quantity, setQuantity] = useState(product?.quantity.toString() || '');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || ProductUnit.kg);
  const [organic, setOrganic] = useState(product?.organic || false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageBlob: ExternalBlob | null = product?.imageBlob || null;

      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const productData = {
        name,
        description,
        category,
        price: parseFloat(price),
        quantity: BigInt(quantity),
        unit,
        organic,
        image: imageBlob,
      };

      if (product) {
        await updateProduct.mutateAsync({ productId: product.id, ...productData });
        toast.success('Product updated successfully! 🌱');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created successfully! 🌱');
      }

      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {product ? 'Edit Product' : 'Plant a New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fresh Tomatoes"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as ProductCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(val) => setUnit(val as ProductUnit)}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductUnit).map((u) => (
                    <SelectItem key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
              )}
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch id="organic" checked={organic} onCheckedChange={setOrganic} />
              <Label htmlFor="organic" className="cursor-pointer">
                🌱 Organic Product
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Saving...'
                : product
                ? 'Update Product'
                : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
