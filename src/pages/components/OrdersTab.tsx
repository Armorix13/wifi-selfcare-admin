import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { OrderData } from "@/lib/types/users";

interface OrdersTabProps {
  orders: OrderData[];
}

const OrdersTab = memo(({ orders }: OrdersTabProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      processing: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
      shipped: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Package },
      delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          User Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <DataTable
            data={orders}
            columns={[
              { key: "orderId", label: "Order ID" },
              { 
                key: "products", 
                label: "Products",
                render: (products) => {
                  const productNames = products.map((p: any) => p.product.title).join(", ");
                  return productNames.length > 50 ? `${productNames.substring(0, 50)}...` : productNames;
                }
              },
              { 
                key: "totalAmount", 
                label: "Amount",
                render: (value) => `₹${value.toLocaleString()}`
              },
              { 
                key: "orderStatus", 
                label: "Status",
                render: (value) => getStatusBadge(value)
              },
              { 
                key: "paymentMethod", 
                label: "Payment",
                render: (value) => (
                  <Badge variant="outline">
                    {value.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                )
              },
              { 
                key: "createdAt", 
                label: "Ordered",
                render: (value) => new Date(value).toLocaleDateString()
              },
              { key: "deliveryAddress", label: "Delivery Address" }
            ]}
          />
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found for this user.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

OrdersTab.displayName = "OrdersTab";

export default OrdersTab;
