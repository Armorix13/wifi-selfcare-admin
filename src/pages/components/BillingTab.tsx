import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { Customer } from "@/lib/dummyData";

interface BillingTabProps {
  user: Customer;
}

const BillingTab = memo(({ user }: BillingTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Billing Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">₹{user.balanceDue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Balance Due</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user.lastBillingDate ? new Date(user.lastBillingDate).toLocaleDateString() : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Last Billing Date</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Next Due Date</div>
          </div>
        </div>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Detailed billing history will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  );
});

BillingTab.displayName = "BillingTab";

export default BillingTab;
