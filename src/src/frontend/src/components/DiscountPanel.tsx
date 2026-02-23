import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDiscounts, Discount } from '../hooks/useDiscounts';
import { ProductCategory } from '../backend';
import { PremiumButton } from './PremiumButton';

export default function DiscountPanel() {
  const { t } = useTranslation();
  const { discounts, createDiscount, updateDiscount, deleteDiscount, getActiveDiscounts, getExpiredDiscounts } = useDiscounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [showExpired, setShowExpired] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'seasonal' as Discount['type'],
    value: 0,
    isPercentage: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    targetType: 'all' as Discount['targetType'],
    targetValue: '',
    active: true,
  });

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        isPercentage: discount.isPercentage,
        minOrderAmount: discount.minOrderAmount || 0,
        maxDiscountAmount: discount.maxDiscountAmount || 0,
        validFrom: discount.validFrom.split('T')[0],
        validUntil: discount.validUntil.split('T')[0],
        targetType: discount.targetType,
        targetValue: discount.targetValue || '',
        active: discount.active,
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        name: '',
        type: 'seasonal',
        value: 0,
        isPercentage: true,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        validFrom: '',
        validUntil: '',
        targetType: 'all',
        targetValue: '',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.validFrom || !formData.validUntil) {
      toast.error(t('messages.error.required'));
      return;
    }

    if (formData.value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    const discountData: Omit<Discount, 'id'> = {
      name: formData.name,
      type: formData.type,
      value: formData.value,
      isPercentage: formData.isPercentage,
      minOrderAmount: formData.minOrderAmount > 0 ? formData.minOrderAmount : undefined,
      maxDiscountAmount: formData.maxDiscountAmount > 0 ? formData.maxDiscountAmount : undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      targetType: formData.targetType,
      targetValue: formData.targetValue || undefined,
      active: formData.active,
    };

    if (editingDiscount) {
      updateDiscount(editingDiscount.id, discountData);
      toast.success(t('messages.success.productUpdated'));
    } else {
      createDiscount(discountData);
      toast.success(t('messages.success.productAdded'));
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDiscount(id);
    toast.success(t('messages.success.productDeleted'));
  };

  const displayedDiscounts = showExpired ? getExpiredDiscounts() : getActiveDiscounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('discounts.title')}</h2>
          <p className="text-muted-foreground">Manage discount codes and promotional offers</p>
        </div>
        <PremiumButton variant="glow" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('discounts.createDiscount')}
        </PremiumButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('discounts.activeDiscounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{getActiveDiscounts().length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('discounts.expiredDiscounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{getExpiredDiscounts().length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{discounts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2">
        <Checkbox checked={showExpired} onCheckedChange={(checked) => setShowExpired(!!checked)} />
        <Label>Show expired discounts</Label>
      </div>

      {/* Discounts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('discounts.discountName')}</TableHead>
              <TableHead>{t('discounts.discountType')}</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  {showExpired ? 'No expired discounts' : 'No active discounts'}
                </TableCell>
              </TableRow>
            ) : (
              displayedDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {discount.type === 'seasonal' && t('discounts.seasonal')}
                      {discount.type === 'bulk' && t('discounts.bulkOrder')}
                      {discount.type === 'firstTime' && t('discounts.firstTimeBuyer')}
                      {discount.type === 'farmer' && 'Farmer Promo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">
                      {discount.isPercentage ? `${discount.value}%` : `₹${discount.value}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(discount.validFrom).toLocaleDateString()} - {new Date(discount.validUntil).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {discount.targetType === 'all' && 'All Products'}
                      {discount.targetType === 'category' && `Category: ${discount.targetValue}`}
                      {discount.targetType === 'product' && `Product: ${discount.targetValue?.slice(0, 8)}...`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PremiumButton variant="scale" onClick={() => handleOpenDialog(discount)} className="h-8 px-3 text-xs">
                        <Edit className="w-3 h-3" />
                      </PremiumButton>
                      <PremiumButton variant="ripple" onClick={() => handleDelete(discount.id)} className="h-8 px-3 text-xs bg-destructive hover:bg-destructive/90">
                        <Trash2 className="w-3 h-3" />
                      </PremiumButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? t('discounts.editDiscount') : t('discounts.createDiscount')}</DialogTitle>
            <DialogDescription>Configure discount details and validity period</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discounts.discountName')}*</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Summer Sale 2026" />
              </div>
              <div className="space-y-2">
                <Label>{t('discounts.discountType')}*</Label>
                <Select value={formData.type} onValueChange={(value: Discount['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">{t('discounts.seasonal')}</SelectItem>
                    <SelectItem value="bulk">{t('discounts.bulkOrder')}</SelectItem>
                    <SelectItem value="firstTime">{t('discounts.firstTimeBuyer')}</SelectItem>
                    <SelectItem value="farmer">Farmer Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Value*</Label>
                <Input
                  type="number"
                  min="0"
                  step={formData.isPercentage ? '1' : '10'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select value={formData.isPercentage ? 'percentage' : 'fixed'} onValueChange={(value) => setFormData({ ...formData, isPercentage: value === 'percentage' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{t('discounts.percentage')} (%)</SelectItem>
                    <SelectItem value="fixed">{t('discounts.fixedAmount')} (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discounts.minOrderAmount')} (₹)</Label>
                <Input type="number" min="0" step="100" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>{t('discounts.maxDiscountAmount')} (₹)</Label>
                <Input type="number" min="0" step="50" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discounts.validFrom')}*</Label>
                <Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('discounts.validUntil')}*</Label>
                <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Apply To</Label>
                <Select value={formData.targetType} onValueChange={(value: Discount['targetType']) => setFormData({ ...formData, targetType: value, targetValue: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category">Specific Category</SelectItem>
                    <SelectItem value="product">Specific Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.targetType !== 'all' && (
                <div className="space-y-2">
                  <Label>{formData.targetType === 'category' ? 'Category' : 'Product ID'}</Label>
                  {formData.targetType === 'category' ? (
                    <Select value={formData.targetValue} onValueChange={(value) => setFormData({ ...formData, targetValue: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.targetValue} onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })} placeholder="Enter product ID" />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })} />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <PremiumButton variant="glow" onClick={handleSubmit}>
              {editingDiscount ? t('profile.save') : t('discounts.createDiscount')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
