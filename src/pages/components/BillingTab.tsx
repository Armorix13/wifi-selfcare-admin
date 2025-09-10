import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, CheckCircle, Clock, AlertTriangle, Download, Upload, Eye, FileText, Image as ImageIcon } from "lucide-react";
import { ClientData, CustomerDetail, BillRequest, UserStatistics } from "@/lib/types/users";
import { BASE_URL } from "@/api";

interface BillingTabProps {
  client: ClientData;
  customerDetail: CustomerDetail;
  billRequests: BillRequest[];
  statistics: UserStatistics;
}

const BillingTab = memo(({ client, customerDetail, billRequests, statistics }: BillingTabProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>("");

  const handleDownload = (url: string, filename: string) => {
    const fullUrl = `${BASE_URL}${url}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageModal = (url: string, title: string) => {
    setSelectedImage(`${BASE_URL}${url}`);
    setImageTitle(title);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      payment_uploaded: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      approved: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, " ").charAt(0).toUpperCase() + status.replace(/_/g, " ").slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Billing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">₹{customerDetail.balanceDue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Balance Due</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {billRequests.length > 0 ? new Date(billRequests[0].requestDate).toLocaleDateString() : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">Last Bill Request</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.totalBillRequests}
              </div>
              <div className="text-sm text-muted-foreground">Total Bill Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Bill Requests ({billRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billRequests.length > 0 ? (
            <DataTable
              data={billRequests}
              columns={[
                { 
                  key: "status", 
                  label: "Status",
                  render: (value) => getStatusBadge(value)
                },
                { 
                  key: "requestDate", 
                  label: "Request Date",
                  render: (value) => new Date(value).toLocaleDateString()
                },
                { 
                  key: "billUploadDate", 
                  label: "Bill Uploaded",
                  render: (value) => value ? new Date(value).toLocaleDateString() : "Not uploaded"
                },
                { 
                  key: "paymentUploadDate", 
                  label: "Payment Uploaded",
                  render: (value) => value ? new Date(value).toLocaleDateString() : "Not uploaded"
                },
                { 
                  key: "billFileUrl", 
                  label: "Bill File",
                  render: (value, row) => value ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(value, `bill_${row.orderId || 'request'}.pdf`)}
                        className="h-8"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openImageModal(value, "Bill Document")}
                        className="h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not available</span>
                  )
                },
                { 
                  key: "paymentProofUrl", 
                  label: "Payment Proof",
                  render: (value, row) => value ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(value, `payment_proof_${row.orderId || 'request'}.pdf`)}
                        className="h-8"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openImageModal(value, "Payment Proof")}
                        className="h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not available</span>
                  )
                }
              ]}
            />
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bill requests found for this user.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installation Requests Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Installation Requests Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{statistics.totalInstallationRequests}</div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{statistics.totalComplaints}</div>
              <div className="text-xs text-muted-foreground">Total Complaints</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{statistics.pendingComplaints}</div>
              <div className="text-xs text-muted-foreground">Pending Complaints</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{statistics.totalOrders}</div>
              <div className="text-xs text-muted-foreground">Total Orders</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {imageTitle}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt={imageTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMzBWMTUwSDcwVjEwMEg1MEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

BillingTab.displayName = "BillingTab";

export default BillingTab;
