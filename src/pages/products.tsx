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
  X
} from "lucide-react";
import { dummyProducts, dummyOrders, dummyProductFeedback, type Product, type Order, type ProductFeedback } from "@/lib/dummyData";
import { useAddProductMutation, useGetCategoriesQuery, useGetProductDashbaordDataQuery } from "@/api";



export function Products() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { data: productDashboardData, isLoading: productDashboardLoading } = useGetProductDashbaordDataQuery({});
  const { data: AllCategories } = useGetCategoriesQuery({})

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


  const [formData, setFormData] = useState({
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
  });
  const [images, setImages] = useState<File[]>([]);

  const [addProduct, { isLoading }] = useAddProductMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    if (e.target.files) {
      setImages((prev: any) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('discount', formData.discount);
    fd.append('category', formData.category);
    fd.append('isActive', String(formData.isActive));
    fd.append('stock', formData.stock);
    fd.append('sku', formData.sku);
    fd.append('brand', formData.brand);

    formData.tags.forEach((tag, i) => fd.append(`tags[${i}]`, tag));
    images.forEach((file) => fd.append('images', file));

    try {
      await addProduct(fd).unwrap();
      setIsAddProductOpen(false);
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
      });
      setImages([]);
    } catch (err) {
      console.error('Error adding product:', err);
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
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new WiFi equipment product to your inventory.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {/* Title & SKU */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Product Name</Label>
                        <Input id="title" placeholder="Enter product name" value={formData.title} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" placeholder="Enter SKU" value={formData.sku} onChange={handleChange} />
                      </div>
                    </div>

                    {/* Brand & Category */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" placeholder="Enter brand name" value={formData.brand} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input id="price" type="number" placeholder="Enter price" value={formData.price} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input id="discount" type="number" placeholder="Enter discount" value={formData.discount} onChange={handleChange} />
                      </div>
                    </div>

                    {/* Stock & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input id="stock" type="number" placeholder="Enter stock quantity" value={formData.stock} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          placeholder="Comma separated tags"
                          onChange={(e: any) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: any) => t.trim()) })}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter product description" rows={3} value={formData.description} onChange={handleChange} />
                    </div>

                    {/* Image Upload with Preview */}
                    <div className="space-y-2">
                      <Label htmlFor="images">Product Images</Label>
                      <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} />

                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {images.map((file, index) => (
                            <div
                              key={index}
                              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm group"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="object-cover w-full h-full"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={16} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Product'}
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
                          <div className="text-sm text-muted-foreground">{product.brand} - {product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.category?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.productType === 'user_sale' ? 'default' : 'secondary'}>
                          {product.productType === 'user_sale' ? 'User Sale' : 'Engineer Only'}
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Truck className="h-4 w-4" />
                          </Button>
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
      </div>
    </MainLayout>
  );
}