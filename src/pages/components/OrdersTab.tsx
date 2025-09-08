import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Order } from "@/lib/dummyData";

interface OrdersTabProps {
  orders: Order[];
}

const OrdersTab = memo(({ orders }: OrdersTabProps) => {
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
              { key: "orderNumber", label: "Order #" },
              { key: "productName", label: "Product" },
              { key: "quantity", label: "Qty" },
              { 
                key: "totalAmount", 
                label: "Amount",
                render: (value) => `₹${value.toLocaleString()}`
              },
              { 
                key: "status", 
                label: "Status",
                render: (value) => (
                  <Badge variant={value === "delivered" ? "default" : "secondary"}>
                    {value}
                  </Badge>
                )
              },
              { 
                key: "createdAt", 
                label: "Ordered",
                render: (value) => new Date(value).toLocaleDateString()
              }
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
