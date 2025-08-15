import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Package,
  ShoppingCart,
  Star,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  User,
  Settings,
  X,
  Calendar,
  Tag,
  Hash,
  DollarSign,
  Percent,
  Box,
  Phone,
  MapPin,
  AlertCircle
} from "lucide-react";
import { dummyProducts, dummyOrders, dummyProductFeedback, type Product, type Order, type ProductFeedback } from "@/lib/dummyData";
import { BASE_URL, useAddProductMutation, useDeleteProductMutation, useGetCategoriesQuery, useGetProductDashbaordDataQuery, useUpdateProductMutation } from "@/api";

// Validation interface
interface ValidationErrors {
  title?: string;
  description?: string;
  price?: string;
  discount?: string;
  category?: string;
  stock?: string;
  sku?: string;
  brand?: string;
  tags?: string;
  images?: string;
  isActive?: string;
  productType?: string;
}

// Form data interface
interface FormData {
  title: string;
  description: string;
  price: string;
  discount: string;
  category: string;
  isActive: boolean;
  stock: string;
  sku: string;
  brand: string;
  tags: string[];
  productType: string;
}

export function Products() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState<any>(null);
  const { data: productDashboardData, isLoading: productDashboardLoading } = useGetProductDashbaordDataQuery({});
  const { data: AllCategories } = useGetCategoriesQuery({});

  const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  // Enhanced form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    isActive: true,
    stock: '',
    sku: '',
    brand: '',
    tags: [],
    productType: 'user_sale'
  });

  const [images, setImages] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [addProduct, { isLoading }] = useAddProductMutation();

  // Validation functions
  const validateField = (field: keyof FormData, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) {
          return 'Product name is required';
        }
        if (value.trim().length < 3) {
          return 'Product name must be at least 3 characters long';
        }
        if (value.trim().length > 100) {
          return 'Product name cannot exceed 100 characters';
        }
        return '';
      
      case 'description':
        if (!value || value.trim().length === 0) {
          return 'Product description is required';
        }
        if (value.trim().length < 10) {
          return 'Product description must be at least 10 characters long';
        }
        if (value.trim().length > 1000) {
          return 'Product description cannot exceed 1000 characters';
        }
        return '';
      
      case 'price':
        if (!value || value.trim().length === 0) {
          return 'Price is required';
        }
        const priceNum = parseFloat(value);
        if (isNaN(priceNum) || priceNum <= 0) {
          return 'Price must be a positive number';
        }
        if (priceNum > 1000000) {
          return 'Price cannot exceed ₹10,00,000';
        }
        return '';
      
      case 'discount':
        if (value && value.trim().length > 0) {
          const discountNum = parseFloat(value);
          if (isNaN(discountNum) || discountNum < 0) {
            return 'Discount must be a non-negative number';
          }
          if (discountNum > 100) {
            return 'Discount cannot exceed 100%';
          }
        }
        return '';
      
      case 'category':
        if (!value || value.trim().length === 0) {
          return 'Please select a category';
        }
        return '';
      
      case 'stock':
        if (!value || value.trim().length === 0) {
          return 'Stock quantity is required';
        }
        const stockNum = parseInt(value);
        if (isNaN(stockNum) || stockNum < 0) {
          return 'Stock quantity must be a non-negative number';
        }
        if (stockNum > 100000) {
          return 'Stock quantity cannot exceed 100,000';
        }
        return '';
      
      case 'sku':
        if (!value || value.trim().length === 0) {
          return 'SKU is required';
        }
        if (value.trim().length < 3) {
          return 'SKU must be at least 3 characters long';
        }
        if (value.trim().length > 50) {
          return 'SKU cannot exceed 50 characters';
        }
        // Check for special characters
        if (!/^[a-zA-Z0-9-_]+$/.test(value.trim())) {
          return 'SKU can only contain letters, numbers, hyphens, and underscores';
        }
        return '';
      
      case 'brand':
        if (!value || value.trim().length === 0) {
          return 'Brand name is required';
        }
        if (value.trim().length < 2) {
          return 'Brand name must be at least 2 characters long';
        }
        if (value.trim().length > 50) {
          return 'Brand name cannot exceed 50 characters';
        }
        return '';
      
      case 'tags':
        if (value && value.length > 0) {
          if (value.length > 10) {
            return 'Cannot add more than 10 tags';
          }
          for (let tag of value) {
            if (tag.trim().length === 0) {
              return 'Tags cannot be empty';
            }
            if (tag.trim().length > 20) {
              return 'Each tag cannot exceed 20 characters';
            }
          }
        }
        return '';
      

      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      const error = validateField(field as keyof FormData, formData[field as keyof FormData]);
      if (error) {
        errors[field as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    // Validate images separately (not part of formData)
    if (images.length === 0) {
      errors.images = 'At least one product image is required';
      isValid = false;
    } else if (images.length > 10) {
      errors.images = 'Cannot upload more than 10 images';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validate field on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    if (e.target?.files) {
      const newFiles = Array.from(e.target.files) as File[];
      
      const validFiles = newFiles.filter((file: File) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });
      
      setImages((prev: any) => [...prev, ...validFiles]);
      
      // Clear image validation error if images are added
      if (validationErrors.images) {
        setValidationErrors(prev => ({ ...prev, images: undefined }));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      
      // Check if we need to show image validation error
      if (newImages.length === 0) {
        setValidationErrors(prevErrors => ({ ...prevErrors, images: 'At least one product image is required' }));
      } else {
        setValidationErrors(prevErrors => ({ ...prevErrors, images: undefined }));
      }
      
      return newImages;
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      category: '',
      isActive: true,
      stock: '',
      sku: '',
      brand: '',
      tags: [],
      productType: 'user_sale'
    });
    setImages([]);
    setValidationErrors({});
    setTouchedFields(new Set());
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields = Object.keys(formData) as (keyof FormData)[];
    setTouchedFields(new Set(allFields));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('price', formData.price);
      fd.append('discount', formData.discount || '0');
      fd.append('category', formData.category);
      fd.append('isActive', String(formData.isActive));
      fd.append('stock', formData.stock);
      fd.append('sku', formData.sku.trim());
      fd.append('brand', formData.brand.trim());
      fd.append('productType', formData.productType);

      if (formData.tags.length > 0) {
        formData.tags.forEach((tag, i) => fd.append(`tags[${i}]`, tag.trim()));
      }
      
      images.forEach((file) => fd.append('images', file));

      await addProduct(fd).unwrap();
      
      // Success - close modal and reset form
      setIsAddProductOpen(false);
      resetForm();
      
      // TODO: Show success toast notification
      
    } catch (err) {
      console.error('Error adding product:', err);
      // TODO: Show error toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAddProductModal = () => {
    setIsAddProductOpen(false);
    resetForm();
  };

  console.log("AllCategories", AllCategories);

  // Use API data or fallback to empty arrays
  const apiData = productDashboardData?.data || {};
  const metrics = apiData.metrics || {};
  const allProducts = apiData.allProducts || [];
  const allOrders = apiData.allOrders || [];
  const categoryDistribution = apiData.categoryDistribution || [];

  // Filter products based on search and filters
  const filteredProducts = allProducts.filter((product: any) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category?.name === categoryFilter;
    const matchesType = typeFilter === "all" || product.productType === typeFilter;
    const matchesStatus = statusFilter === "all" || (product.isActive && statusFilter === "active") || (!product.isActive && statusFilter === "inactive");

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Calculate analytics data from API
  const totalProducts = metrics.totalProducts || 0;
  const activeProducts = metrics.activeProducts || 0;
  const lowStockProducts = metrics.lowStockAlerts || 0;
  const totalInventoryValue = metrics.inventoryValue || 0;

  const totalOrders = metrics.totalOrders || 0;
  const pendingOrders = metrics.pendingOrders || 0;
  const completedOrders = metrics.completedOrders || 0;
  const totalOrderValue = metrics.totalRevenue || 0;

  const avgRating = metrics.averageRating || 0;
  const totalReviews = 0; // Not in API response
  const positiveReviews = metrics.positiveReviews || 0;

  // Generate order number for display
  const generateOrderNumber = (orderId: any) => {
    return `ORD-${orderId.slice(-8).toUpperCase()}`;
  };

  // Get product name from order
  const getOrderProductName = (order: any) => {
    if (order.products && order.products.length > 0) {
      return order.products[0].product.title;
    }
    return "Unknown Product";
  };

  // Get total quantity from order
  const getOrderQuantity = (order: any) => {
    if (order.products && order.products.length > 0) {
      return order.products.reduce((sum: any, item: any) => sum + item.quantity, 0);
    }
    return 0;
  };

  // Get customer/engineer name
  const getCustomerName = (order: any) => {
    if (order.user) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return order.name || "Unknown Customer";
  };

  // Get order type
  const getOrderType = (order: any) => {
    if (order.user && order.user.role === 'engineer') {
      return 'engineer-request';
    }
    return 'user-purchase';
  };

  // Handle product details view
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  // Close product details modal
  const handleCloseProductDetails = () => {
    setIsProductDetailsOpen(false);
    setSelectedProduct(null);
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      category: product.category?._id || product.category || '',
      tags: product.tags || []
    });
    setIsEditProductOpen(true);
  };

  // Close edit product modal
  const handleCloseEditProduct = () => {
    setIsEditProductOpen(false);
    setEditingProduct(null);
  };

  // Handle delete product
  const handleDeleteProduct = (product: any) => {
    setDeletingProduct(product);
    setIsDeleteProductOpen(true);
  };

  // Close delete product modal
  const handleCloseDeleteProduct = () => {
    setIsDeleteProductOpen(false);
    setDeletingProduct(null);
  };

  // Handle order details view
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Close order details modal
  const handleCloseOrderDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Handle delivery details view
  const handleViewDelivery = (order: any) => {
    setDeliveryOrder(order);
    setIsDeliveryDetailsOpen(true);
  };

  // Close delivery details modal
  const handleCloseDeliveryDetails = () => {
    setIsDeliveryDetailsOpen(false);
    setDeliveryOrder(null);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      // Call the actual delete API
      await deleteProduct(deletingProduct._id).unwrap();

      // Close modal and reset
      setIsDeleteProductOpen(false);
      setDeletingProduct(null);
      setIsDeleting(false);

      // Show success message or refresh data
      // You can add toast notification here

      // TODO: Refresh the products list after successful deletion
      // This could be done by refetching the dashboard data

    } catch (err) {
      console.error('Error deleting product:', err);
      setIsDeleting(false);
      // Show error message
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get product type label
  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'user_sale':
        return 'User Sale';
      case 'engineer_only':
        return 'Engineer Only';
      default:
        return 'Unknown';
    }
  };

  // Get product type variant
  const getProductTypeVariant = (type: string) => {
    switch (type) {
      case 'user_sale':
        return 'default';
      case 'engineer_only':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get order status variant
  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'confirmed':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'online_payment':
        return 'Online Payment';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async () => {
    if (!editingProduct) {
      console.error('No product selected for editing');
      return;
    }

    console.log('Submitting edit for product:', editingProduct);

    const fd = new FormData();
    fd.append('title', editingProduct.title || '');
    fd.append('description', editingProduct.description || '');
    fd.append('price', String(editingProduct.price || 0));
    fd.append('discount', String(editingProduct.discount || 0));
    fd.append('category', editingProduct.category || '');
    fd.append('isActive', String(editingProduct.isActive || true));
    fd.append('stock', String(editingProduct.stock || 0));
    fd.append('sku', editingProduct.sku || '');
    fd.append('brand', editingProduct.brand || '');
    fd.append('productType', editingProduct.productType || 'user_sale');

    if (editingProduct.tags && editingProduct.tags.length > 0) {
      editingProduct.tags.forEach((tag: any, i: number) => fd.append(`tags[${i}]`, tag));
    }

    // Add new images if any
    if (images && images.length > 0) {
      images.forEach((file) => fd.append('images', file));
    }

    try {
      console.log('Sending update request for product ID:', editingProduct._id);
      
      // Call the actual update API
      const result = await updateProduct({ id: editingProduct._id, body: fd }).unwrap();
      
      console.log('Update successful:', result);
      
      // Close modal and reset
      setIsEditProductOpen(false);
      setEditingProduct(null);
      setImages([]);
      
      // TODO: Refresh the products list after successful update
      // You can add toast notification here
      alert('Product updated successfully!');
      
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
    }
  };

  // Handle edit image change
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const validFiles = newFiles.filter((file: File) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });
      setImages((prev: any) => [...prev, ...validFiles]);
    }
  };

  // Remove existing image from editing product
  const handleRemoveExistingImage = (imageIndex: number) => {
    if (editingProduct) {
      const updatedImages = editingProduct.images.filter((_: any, i: number) => i !== imageIndex);
      setEditingProduct({ ...editingProduct, images: updatedImages });
    }
  };

  // Remove new image
  const handleRemoveNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle drag and drop for edit modal
  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary/5');
  };

  const handleEditDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files) as File[];
      const validFiles = newFiles.filter((file: File) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  // Handle drag and drop for add modal
  const handleAddDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary/5');
  };

  const handleAddDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
  };

  const handleAddDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files) as File[];
      const validFiles = newFiles.filter((file: File) => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 10MB`);
          return false;
        }
        return true;
      });
      
      setImages(prev => [...prev, ...validFiles]);
    }
  };


  return (
    <MainLayout title="Product Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
            <p className="text-muted-foreground">
              Manage WiFi equipment inventory, orders, and customer feedback
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Product Feedback
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{activeProducts} active</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Products below threshold
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total stock value
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">
                    From {totalReviews} reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{completedOrders} completed</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalOrderValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total order revenue
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(0) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    4+ star ratings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Product Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryDistribution.map((categoryData: any) => (
                    <div key={categoryData._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{categoryData.category.replace('-', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground">{categoryData.count} products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${categoryData.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{categoryData.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryDistribution.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user_sale">User Sale</SelectItem>
                  <SelectItem value="engineer_only">Engineer Only</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="text-center sm:text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeAddProductModal}
                        className="absolute right-4 top-4 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-foreground">Add New Product</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Add a new WiFi equipment product to your inventory. All fields marked with * are required.
                    </DialogDescription>
                    
                    {/* Form Progress Indicator */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Form Completion</span>
                        <span className="font-medium">
                          {Math.round((Object.keys(formData).filter(key => {
                            const value = formData[key as keyof FormData];
                            if (key === 'tags') return Array.isArray(value) && value.length > 0;
                            if (key === 'discount') return true; // Optional field
                            if (key === 'isActive' || key === 'productType') return true; // Has default values
                            return value && value.toString().trim().length > 0;
                          }).length / Object.keys(formData).length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(Object.keys(formData).filter(key => {
                              const value = formData[key as keyof FormData];
                              if (key === 'tags') return Array.isArray(value) && value.length > 0;
                              if (key === 'discount') return true; // Optional field
                              if (key === 'isActive' || key === 'productType') return true; // Has default values
                              return value && value.toString().trim().length > 0;
                            }).length / Object.keys(formData).length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {/* Title & SKU */}
                    <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                          <Label htmlFor="title">Product Name *</Label>
                          <Input 
                            id="title" 
                            placeholder="Enter product name" 
                            value={formData.title} 
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            onBlur={() => handleFieldBlur('title')}
                            className={validationErrors.title && touchedFields.has('title') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.title && touchedFields.has('title') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.title}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              {formData.title.length}/100 characters
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <Input 
                            id="sku" 
                            placeholder="Enter SKU" 
                            value={formData.sku} 
                            onChange={(e) => handleFieldChange('sku', e.target.value)}
                            onBlur={() => handleFieldBlur('sku')}
                            className={validationErrors.sku && touchedFields.has('sku') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.sku && touchedFields.has('sku') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.sku}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              {formData.sku.length}/50 characters
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Brand & Category */}
                    <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                          <Label htmlFor="brand">Brand *</Label>
                          <Input 
                            id="brand" 
                            placeholder="Enter brand name" 
                            value={formData.brand} 
                            onChange={(e) => handleFieldChange('brand', e.target.value)}
                            onBlur={() => handleFieldBlur('brand')}
                            className={validationErrors.brand && touchedFields.has('brand') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.brand && touchedFields.has('brand') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.brand}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              {formData.brand.length}/50 characters
                            </div>
                          </div>
                        </div>
                                              <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value: any) => handleFieldChange('category', value)}
                          >
                            <SelectTrigger className={validationErrors.category && touchedFields.has('category') ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {AllCategories?.data?.map((cat: any) => (
                                <SelectItem key={cat._id} value={cat._id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors.category && touchedFields.has('category') && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                              <AlertCircle className="h-4 w-4" />
                              {validationErrors.category}
                            </div>
                          )}
                        </div>

                    </div>

                    {/* Price & Discount */}
                    <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                          <Label htmlFor="price">Price (₹) *</Label>
                          <Input 
                            id="price" 
                            type="number" 
                            placeholder="Enter price" 
                            value={formData.price} 
                            onChange={(e) => handleFieldChange('price', e.target.value)}
                            onBlur={() => handleFieldBlur('price')}
                            className={validationErrors.price && touchedFields.has('price') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.price && touchedFields.has('price') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.price}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              Range: ₹1 - ₹10,00,000
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount">Discount (%)</Label>
                          <Input 
                            id="discount" 
                            type="number" 
                            placeholder="Enter discount" 
                            value={formData.discount} 
                            onChange={(e) => handleFieldChange('discount', e.target.value)}
                            onBlur={() => handleFieldBlur('discount')}
                            className={validationErrors.discount && touchedFields.has('discount') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.discount && touchedFields.has('discount') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.discount}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              Range: 0% - 100%
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Stock & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input 
                            id="stock" 
                            type="number" 
                            placeholder="Enter stock quantity" 
                            value={formData.stock} 
                            onChange={(e) => handleFieldChange('stock', e.target.value)}
                            onBlur={() => handleFieldBlur('stock')}
                            className={validationErrors.stock && touchedFields.has('stock') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.stock && touchedFields.has('stock') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.stock}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              Range: 0 - 100,000
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            placeholder="Comma separated tags"
                            onChange={(e: any) => handleFieldChange('tags', e.target.value.split(',').map((t: any) => t.trim()))}
                            onBlur={() => handleFieldBlur('tags')}
                            className={validationErrors.tags && touchedFields.has('tags') ? 'border-red-500' : ''}
                          />
                          <div className="flex items-center justify-between">
                            {validationErrors.tags && touchedFields.has('tags') && (
                              <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {validationErrors.tags}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground ml-auto">
                              {formData.tags.length}/10 tags
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Product Type & Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productType">Product Type</Label>
                        <Select
                          value={formData.productType}
                          onValueChange={(value: any) => handleFieldChange('productType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user_sale">User Sale</SelectItem>
                            <SelectItem value="engineer_only">Engineer Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isActive">Status</Label>
                        <Select
                          value={formData.isActive.toString()}
                          onValueChange={(value: any) => handleFieldChange('isActive', value === 'true')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter product description" 
                        rows={3} 
                        value={formData.description} 
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        onBlur={() => handleFieldBlur('description')}
                        className={validationErrors.description && touchedFields.has('description') ? 'border-red-500' : ''}
                      />
                      <div className="flex items-center justify-between">
                        {validationErrors.description && touchedFields.has('description') && (
                          <div className="flex items-center gap-1 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {validationErrors.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground ml-auto">
                          {formData.description.length}/1000 characters
                        </div>
                      </div>
                    </div>

                    {/* Image Upload with Preview */}
                    <div className="space-y-4">
                      <Label htmlFor="images">Product Images *</Label>
                      <div className="flex items-center justify-between">
                        {validationErrors.images && touchedFields.has('images') && (
                          <div className="flex items-center gap-1 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {validationErrors.images}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground ml-auto">
                          {images.length}/10 images (Max 10MB each)
                        </div>
                      </div>
                      
                      {/* File Upload Area */}
                      <div className="relative">
                        <label
                          htmlFor="images"
                          className="block w-full p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200 rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 group relative overflow-hidden"
                          onDragOver={handleAddDragOver}
                          onDragLeave={handleAddDragLeave}
                          onDrop={handleAddDrop}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                              <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/70 transition-colors">
                                PNG, JPG, GIF up to 10MB each
                              </p>
                            </div>
                          </div>
                          {/* Subtle background animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
                        </label>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>

                      {images.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Selected Images</span>
                            <span className="text-xs text-muted-foreground">
                              {images.length} image{images.length !== 1 ? 's' : ''} selected
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((file, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-lg overflow-hidden border border-border shadow-sm relative group bg-muted/20"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Image ${index + 1}`}
                                  className="object-cover w-full h-full"
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Removing image: ${file.name} at index: ${index}`);
                                    console.log('Remove button clicked for index:', index, 'file:', file.name);
                                    setImages(prev => {
                                      const newImages = prev.filter((_, i) => i !== index);
                                      console.log('New images array after removal:', newImages);
                                      return newImages;
                                    });
                                  }}
                                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110 z-50"
                                  title={`Remove ${file.name}`}
                                  style={{ zIndex: 50 }}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                
                                {/* File Info Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <div className="text-center">
                                      <p className="text-xs text-white font-medium truncate" title={file.name}>
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-white/80">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Selection Indicator */}
                                <div className="absolute top-2 left-2">
                                  <div className="w-5 h-5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Remove All Button */}
                          {images.length > 1 && (
                            <div className="flex justify-center pt-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Remove all images clicked');
                                  setImages([]);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center gap-1.5"
                              >
                                <X className="h-3.5 w-3.5" />
                                Remove All Images
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Validation Summary */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Please fix the following errors:</span>
                      </div>
                      <ul className="text-sm text-destructive space-y-1">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-destructive rounded-full"></span>
                            <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}: {error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Help Text */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Tips for better product listings:</span>
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Use clear, descriptive product names that customers can easily search for</li>
                      <li>• Include detailed descriptions highlighting key features and benefits</li>
                      <li>• Upload high-quality images from multiple angles</li>
                      <li>• Set competitive pricing and reasonable discount percentages</li>
                      <li>• Use relevant tags to improve product discoverability</li>
                    </ul>
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || isSubmitting}
                      className="w-full sm:w-auto min-w-[120px]"
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.brand} - 
                            {product.sku ? (
                              <>
                                <span className="ml-1">
                                  {product.sku.length > 8 ? product.sku.substring(0, 8) + '...' : product.sku}
                                </span>
                                {product.sku.length > 8 && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-xs text-primary hover:text-primary/80 ml-1"
                                    onClick={() => handleViewProduct(product)}
                                  >
                                    View More
                                  </Button>
                                )}
                              </>
                            ) : (
                              <span className="ml-1 italic">No SKU</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.category?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getProductTypeVariant(product.productType)}>
                          {getProductTypeLabel(product.productType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                            {product.stock}
                          </span>
                          {product.stock <= 5 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>₹{product.finalPrice ? product.finalPrice.toLocaleString() : product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-9 w-80" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer/Engineer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{generateOrderNumber(order._id)}</TableCell>
                      <TableCell>{getOrderProductName(order)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getOrderType(order) === 'user-purchase' ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Settings className="h-4 w-4 text-green-500" />
                          )}
                          <span>{getCustomerName(order)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOrderType(order) === 'user-purchase' ? 'default' : 'secondary'}>
                          {getOrderType(order) === 'user-purchase' ? 'Customer' : 'Engineer'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getOrderQuantity(order)}</TableCell>
                      <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.orderStatus === 'delivered' ? 'default' :
                              order.orderStatus === 'pending' ? 'destructive' :
                                'secondary'
                          }
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.orderStatus === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => handleViewDelivery(order)}>
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Product Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search feedback..." className="pl-9 w-80" />
              </div>
            </div>

            <div className="grid gap-6">
              {dummyProductFeedback.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{feedback.title}</h3>
                        <p className="text-sm text-muted-foreground">{feedback.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          by {feedback.customerName || feedback.engineerName} • {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                        </div>
                        {feedback.verifiedPurchase && (
                          <Badge variant="secondary">Verified Purchase</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{feedback.comment}</p>

                    {feedback.pros.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-green-600 mb-2">Pros:</h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.pros.map((pro, index) => (
                            <Badge key={index} variant="outline" className="text-green-600">
                              + {pro}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.cons.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-red-600 mb-2">Cons:</h4>
                        <div className="flex flex-wrap gap-2">
                          {feedback.cons.map((con, index) => (
                            <Badge key={index} variant="outline" className="text-red-600">
                              - {con}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {feedback.helpfulVotes} people found this helpful
                        </span>
                        {feedback.wouldRecommend && (
                          <Badge variant="outline" className="text-green-600">
                            Would Recommend
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Helpful
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Details Modal */}
        <Dialog open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center sm:text-left">
              <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">Product Details</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete information about the selected product
              </DialogDescription>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Header */}
                <div className="flex items-start gap-6">
                  {/* Product Images */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        selectedProduct.images.map((image: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border shadow-sm">
                            <img
                              src={`${BASE_URL}${image}`}
                              alt={`${selectedProduct.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                          <Package className="h-12 w-12 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground ml-2">No Images</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedProduct.title}</h2>
                      <p className="text-lg text-muted-foreground">{selectedProduct.brand}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={getProductTypeVariant(selectedProduct.productType)}>
                        {getProductTypeLabel(selectedProduct.productType)}
                      </Badge>
                      <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedProduct.category?.name || 'Unknown Category'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Stock: {selectedProduct.stock} units</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Original Price: ₹{selectedProduct.price?.toLocaleString()}</span>
                        </div>
                        {selectedProduct.discount && selectedProduct.discount > 0 && (
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">Discount: {selectedProduct.discount}%</span>
                          </div>
                        )}
                      </div>
                      {selectedProduct.finalPrice && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-xl font-bold text-green-600">Final Price: ₹{selectedProduct.finalPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {selectedProduct.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="text-lg font-medium">{selectedProduct.averageRating}/5</span>
                        <span className="text-sm text-muted-foreground">({selectedProduct.totalReviews || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                </div>

                {/* Product Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-border text-muted-foreground">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Product Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Product ID</span>
                        <span className="text-sm text-foreground font-mono">{selectedProduct._id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Category</span>
                        <span className="text-sm text-foreground">{selectedProduct.category?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Product Type</span>
                        <span className="text-sm text-foreground">{getProductTypeLabel(selectedProduct.productType)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                          {selectedProduct.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Inventory & Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-muted-foreground">Stock Quantity</span>
                        <span className={`text-sm font-medium ${selectedProduct.stock <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                          {selectedProduct.stock} units
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-muted-foreground">Original Price</span>
                        <span className="text-sm text-foreground">₹{selectedProduct.price?.toLocaleString()}</span>
                      </div>
                      {selectedProduct.discount && selectedProduct.discount > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-muted-foreground">Discount</span>
                          <span className="text-sm text-destructive">{selectedProduct.discount}%</span>
                        </div>
                      )}
                      {selectedProduct.finalPrice && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-muted-foreground">Final Price</span>
                          <span className="text-sm font-bold text-green-600">₹{selectedProduct.finalPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-muted-foreground">Created</span>
                        <span className="text-sm text-foreground">{formatDate(selectedProduct.createdAt)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                        <span className="text-sm text-foreground">{formatDate(selectedProduct.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseProductDetails}>
                Close
              </Button>
              <Button onClick={() => {
                handleCloseProductDetails();
                handleEditProduct(selectedProduct);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleCloseProductDetails();
                  handleDeleteProduct(selectedProduct);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center sm:text-left">
              <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">Edit Product</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update the details of the selected product.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Title & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Product Name</Label>
                  <Input 
                    name="title" 
                    placeholder="Enter product name" 
                    value={editingProduct?.title || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSku">SKU</Label>
                  <Input 
                    name="sku" 
                    placeholder="Enter SKU" 
                    value={editingProduct?.sku || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editBrand">Brand</Label>
                  <Input 
                    name="brand" 
                    placeholder="Enter brand name" 
                    value={editingProduct?.brand || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Category</Label>
                  <Select
                    value={editingProduct?.category || ''}
                    onValueChange={(value: any) => setEditingProduct({ ...editingProduct, category: value })}
                  >
                    <SelectTrigger id="editCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {AllCategories?.data?.map((cat: any) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPrice">Price (₹)</Label>
                  <Input 
                    name="price" 
                    type="number" 
                    placeholder="Enter price" 
                    value={editingProduct?.price || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDiscount">Discount (%)</Label>
                  <Input 
                    name="discount" 
                    type="number" 
                    placeholder="Enter discount" 
                    value={editingProduct?.discount || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
              </div>

              {/* Stock & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStock">Stock Quantity</Label>
                  <Input 
                    name="stock" 
                    type="number" 
                    placeholder="Enter stock quantity" 
                    value={editingProduct?.stock || ''} 
                    onChange={handleEditChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTags">Tags</Label>
                  <Input
                    name="tags"
                    placeholder="Comma separated tags"
                    value={editingProduct?.tags?.join(', ') || ''}
                    onChange={(e: any) => setEditingProduct({ ...editingProduct, tags: e.target.value.split(',').map((t: any) => t.trim()) })}
                  />
                </div>
              </div>

              {/* Product Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editProductType">Product Type</Label>
                  <Select
                    value={editingProduct?.productType || ''}
                    onValueChange={(value: any) => setEditingProduct({ ...editingProduct, productType: value })}
                  >
                    <SelectTrigger id="editProductType">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_sale">User Sale</SelectItem>
                      <SelectItem value="engineer_only">Engineer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIsActive">Status</Label>
                  <Select
                    value={editingProduct?.isActive?.toString() || 'true'}
                    onValueChange={(value: any) => setEditingProduct({ ...editingProduct, isActive: value === 'true' })}
                  >
                    <SelectTrigger id="editIsActive">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  name="description" 
                  placeholder="Enter product description" 
                  rows={3} 
                  value={editingProduct?.description || ''} 
                  onChange={handleEditChange} 
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Product Images</Label>
                
                                      {/* File Upload Area */}
                      <div className="relative">
                                                <label
                          htmlFor="editImages"
                          className="block w-full p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200 rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 group relative overflow-hidden"
                          onDragOver={handleEditDragOver}
                          onDragLeave={handleEditDragLeave}
                          onDrop={handleEditDrop}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                              <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/70 transition-colors">
                                PNG, JPG, GIF up to 10MB each
                              </p>
                            </div>
                          </div>
                          {/* Subtle background animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
                        </label>
                  <input
                    id="editImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </div>

                {/* Images Preview Grid */}
                {(editingProduct?.images?.length > 0 || images.length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Product Images</span>
                      <span className="text-xs text-muted-foreground">
                        {editingProduct?.images?.length || 0 + images.length} image{(editingProduct?.images?.length || 0 + images.length) !== 1 ? 's' : ''} total
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Existing images preview */}
                      {editingProduct?.images && editingProduct.images.length > 0 && (
                        <>
                          {editingProduct.images.map((image: string, index: number) => (
                            <div
                              key={`existing-${index}`}
                              className="aspect-square rounded-lg overflow-hidden border border-border shadow-sm relative group bg-muted/20"
                            >
                              <img
                                src={`${BASE_URL}${image}`}
                                alt={`${editingProduct.title} ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                              
                              {/* Remove Button - Always Visible */}
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(index)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110 group-hover:bg-red-600"
                                title="Remove existing image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              
                              {/* Status Badge */}
                              <div className="absolute top-2 left-2">
                                <div className="px-2 py-1 rounded-full bg-blue-500/90 text-white text-xs font-medium shadow-sm">
                                  Existing
                                </div>
                              </div>
                              
                              {/* Image Info Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                  <div className="text-center">
                                    <p className="text-xs text-white font-medium">
                                      Existing Image {index + 1}
                                    </p>
                                    <p className="text-xs text-white/80">
                                      Click X to remove
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* New images preview */}
                      {images.map((file, index) => (
                        <div
                          key={`new-${index}`}
                          className="aspect-square rounded-lg overflow-hidden border border-border shadow-sm relative group bg-muted/20"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          
                          {/* Remove Button - Always Visible */}
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-110 group-hover:bg-red-600"
                            title={`Remove ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <div className="px-2 py-1 rounded-full bg-green-500/90 text-white text-xs font-medium shadow-sm">
                              New
                            </div>
                          </div>
                          
                          {/* File Info Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <div className="text-center">
                                <p className="text-xs text-white font-medium truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-white/80">
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          <div className="absolute bottom-2 right-2">
                            <div className="w-5 h-5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{index + 1}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Buttons */}
                    {(editingProduct?.images?.length > 0 || images.length > 0) && (
                      <div className="flex justify-center gap-3 pt-2">
                        {images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setImages([])}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove All New Images
                          </button>
                        )}
                        {editingProduct?.images?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: [] })}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 flex items-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove All Existing Images
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                             <Button 
                 variant="outline" 
                 onClick={handleCloseEditProduct}
                 disabled={isUpdatingProduct}
                 className="w-full sm:w-auto order-2 sm:order-1"
               >
                 Cancel
               </Button>
                             <Button 
                 type="button" 
                 onClick={handleEditSubmit} 
                 disabled={isUpdatingProduct}
                 className="w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
               >
                 {isUpdatingProduct ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                     Saving...
                   </>
                 ) : (
                   <>
                     <CheckCircle className="h-4 w-4 mr-2" />
                     Save Changes
                   </>
                 )}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation Modal */}
        <Dialog open={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20 mb-4">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Delete Product
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingProduct?.title}"</span>?
              </DialogDescription>
            </DialogHeader>

            {deletingProduct && (
              <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 mb-4 border border-border">
                <div className="flex items-center gap-3">
                  {deletingProduct.images && deletingProduct.images.length > 0 ? (
                    <img
                      src={`${BASE_URL}${deletingProduct.images[0]}`}
                      alt={deletingProduct.title}
                      className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm"

                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{deletingProduct.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{deletingProduct.brand}</p>
                    <p className="text-sm text-muted-foreground">SKU: {deletingProduct.sku}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {deletingProduct.category?.name || 'Unknown'}
                      </Badge>
                      <Badge
                        variant={deletingProduct.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {deletingProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive dark:text-destructive/90">
                    This action cannot be undone.
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    This will permanently delete the product and remove it from all orders and inventory.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={handleCloseDeleteProduct}
                disabled={isDeletingProduct}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeletingProduct}
                className="w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
              >
                {isDeletingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Details Modal */}
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center sm:text-left">
              <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">Order Details</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete information about the selected order.
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Order ID</span>
                        <span className="text-sm text-foreground font-mono">{generateOrderNumber(selectedOrder._id)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Order Type</span>
                        <Badge variant={getOrderType(selectedOrder) === 'user-purchase' ? 'default' : 'secondary'}>
                          {getOrderType(selectedOrder) === 'user-purchase' ? 'Customer' : 'Engineer'}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Order Status</span>
                        <Badge variant={getOrderStatusVariant(selectedOrder.orderStatus)}>
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                        <span className="text-sm text-foreground">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                        <span className="text-sm font-bold text-green-600">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Order Date</span>
                        <span className="text-sm text-foreground">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                        <span className="text-sm text-foreground">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Customer/Engineer Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Name</span>
                        <span className="text-sm text-foreground">{getCustomerName(selectedOrder)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Role</span>
                        <Badge variant={selectedOrder.user?.role === 'engineer' ? 'secondary' : 'default'}>
                          {selectedOrder.user?.role || 'Customer'}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Phone</span>
                        <span className="text-sm text-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedOrder.phoneNumber || selectedOrder.user?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground">Country Code</span>
                        <span className="text-sm text-foreground">{selectedOrder.countryCode || '+91'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Delivery Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Delivery Address</span>
                      <span className="text-sm text-foreground flex items-center gap-1 max-w-[300px] text-right">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        {selectedOrder.deliveryAddress || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">State</span>
                      <span className="text-sm text-foreground">{selectedOrder.state || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">District</span>
                      <span className="text-sm text-foreground">{selectedOrder.district || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm font-medium text-muted-foreground">Pincode</span>
                      <span className="text-sm text-foreground">{selectedOrder.pincode || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground">Order Items</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.product.images && item.product.images.length > 0 ? (
                                  <img
                                    src={`${BASE_URL}${item.product.images[0]}`}
                                    alt={item.product.title}
                                    className="w-12 h-12 rounded-lg object-cover border border-border"

                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{item.product.title}</div>
                                  <div className="text-sm text-muted-foreground">{item.product.brand} - {item.product.sku}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell>₹{item.price?.toLocaleString() || '0'}</TableCell>
                            <TableCell className="font-medium">₹{((item.price || 0) * item.quantity).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No products found in this order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {selectedOrder.orderStatus === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleCloseOrderDetails()}>
                      Cancel Order
                    </Button>
                    <Button onClick={() => handleViewDelivery(selectedOrder)}>
                      Mark as Shipped
                    </Button>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseOrderDetails}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery Details Modal */}
        <Dialog open={isDeliveryDetailsOpen} onOpenChange={setIsDeliveryDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Mark as Shipped
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Confirm that the order has been delivered to the customer.
              </DialogDescription>
            </DialogHeader>

            {deliveryOrder && (
              <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 mb-4 border border-border">
                <div className="flex items-center gap-3">
                  {deliveryOrder.products && deliveryOrder.products.length > 0 && deliveryOrder.products[0].product.images && deliveryOrder.products[0].product.images.length > 0 ? (
                    <img
                      src={`${BASE_URL}${deliveryOrder.products[0].product.images[0]}`}
                      alt={deliveryOrder.products[0].product.title}
                      className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm"

                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {deliveryOrder.products && deliveryOrder.products.length > 0 ? deliveryOrder.products[0].product.title : 'Unknown Product'}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      Quantity: {deliveryOrder.products && deliveryOrder.products.length > 0 ? deliveryOrder.products[0].quantity : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Order ID: {generateOrderNumber(deliveryOrder._id)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary dark:text-primary/90">
                    Confirm Delivery
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    This action will mark the order as delivered and update its status.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={handleCloseDeliveryDetails}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  handleCloseDeliveryDetails();
                  // TODO: Replace with actual update API call to mark as shipped
                  console.log('Marking order as shipped:', deliveryOrder._id);
                }}
                className="w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
              >
                Mark as Shipped
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}