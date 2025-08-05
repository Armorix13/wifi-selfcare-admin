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
  Settings
} from "lucide-react";
import { dummyProducts, dummyOrders, dummyProductFeedback, type Product, type Order, type ProductFeedback } from "@/lib/dummyData";

export function Products() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products based on search and filters
  const filteredProducts = dummyProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesType = typeFilter === "all" || product.productType === typeFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Calculate analytics data
  const totalProducts = dummyProducts.length;
  const activeProducts = dummyProducts.filter(p => p.status === "active").length;
  const lowStockProducts = dummyProducts.filter(p => p.stock <= p.lowStockThreshold).length;
  const totalInventoryValue = dummyProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  
  const totalOrders = dummyOrders.length;
  const pendingOrders = dummyOrders.filter(o => o.status === "pending").length;
  const completedOrders = dummyOrders.filter(o => o.status === "delivered").length;
  const totalOrderValue = dummyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const avgRating = dummyProductFeedback.reduce((sum, f) => sum + f.rating, 0) / dummyProductFeedback.length;
  const totalReviews = dummyProductFeedback.length;
  const positiveReviews = dummyProductFeedback.filter(f => f.rating >= 4).length;

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
                <div className="text-2xl font-bold text-green-600">{((positiveReviews/totalReviews)*100).toFixed(0)}%</div>
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
                {Array.from(new Set(dummyProducts.map(p => p.category))).map(category => {
                  const count = dummyProducts.filter(p => p.category === category).length;
                  const percentage = (count / totalProducts) * 100;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{category.replace('-', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground">{count} products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
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
                <SelectItem value="router">Router</SelectItem>
                <SelectItem value="modem">Modem</SelectItem>
                <SelectItem value="cable">Cable</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
                <SelectItem value="extender">Extender</SelectItem>
                <SelectItem value="fiber-cable">Fiber Cable</SelectItem>
                <SelectItem value="power-supply">Power Supply</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user-sale">User Sale</SelectItem>
                <SelectItem value="engineer-only">Engineer Only</SelectItem>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" placeholder="Enter product name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="Enter model number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" placeholder="Enter brand name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="router">Router</SelectItem>
                          <SelectItem value="modem">Modem</SelectItem>
                          <SelectItem value="cable">Cable</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                          <SelectItem value="extender">Extender</SelectItem>
                          <SelectItem value="fiber-cable">Fiber Cable</SelectItem>
                          <SelectItem value="power-supply">Power Supply</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Product Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user-sale">User Sale</SelectItem>
                          <SelectItem value="engineer-only">Engineer Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input id="price" type="number" placeholder="Enter price" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input id="stock" type="number" placeholder="Enter stock quantity" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Low Stock Threshold</Label>
                      <Input id="threshold" type="number" placeholder="Enter threshold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter product description" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input id="supplier" placeholder="Enter supplier name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warranty">Warranty</Label>
                      <Input id="warranty" placeholder="Enter warranty period" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsAddProductOpen(false)}>
                    Add Product
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
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.brand} - {product.model}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.productType === 'user-sale' ? 'default' : 'secondary'}>
                        {product.productType === 'user-sale' ? 'User Sale' : 'Engineer Only'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.stock <= product.lowStockThreshold ? 'text-red-600 font-medium' : ''}>
                          {product.stock}
                        </span>
                        {product.stock <= product.lowStockThreshold && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
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
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.orderType === 'user-purchase' ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Settings className="h-4 w-4 text-green-500" />
                        )}
                        <span>{order.customerName || order.engineerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.orderType === 'user-purchase' ? 'default' : 'secondary'}>
                        {order.orderType === 'user-purchase' ? 'Customer' : 'Engineer'}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'default' : 
                          order.status === 'pending' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.priority === 'urgent' ? 'destructive' : 
                          order.priority === 'high' ? 'default' : 
                          'secondary'
                        }
                      >
                        {order.priority}
                      </Badge>
                    </TableCell>
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