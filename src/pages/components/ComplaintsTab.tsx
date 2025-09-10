import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Clock, User, AlertTriangle, CheckCircle, Eye, Image as ImageIcon, Download } from "lucide-react";
import { ComplaintData } from "@/lib/types/users";
import { BASE_URL } from "@/api";

interface ComplaintsTabProps {
  complaints: ComplaintData[];
}

const ComplaintsTab = memo(({ complaints }: ComplaintsTabProps) => {
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
      assigned: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: User },
      resolved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      closed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle },
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-green-100 text-green-800 border-green-200" },
      medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      high: { color: "bg-red-100 text-red-800 border-red-200" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

    return (
      <Badge className={`${config.color} border-0`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            User Complaints ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length > 0 ? (
            <DataTable
              data={complaints}
              columns={[
                { key: "id", label: "Complaint ID" },
                { key: "title", label: "Title" },
                { 
                  key: "priority", 
                  label: "Priority",
                  render: (value) => getPriorityBadge(value)
                },
                { 
                  key: "status", 
                  label: "Status",
                  render: (value) => getStatusBadge(value)
                },
                { 
                  key: "type", 
                  label: "Type",
                  render: (value) => (
                    <Badge variant="outline">
                      {value}
                    </Badge>
                  )
                },
                { 
                  key: "createdAt", 
                  label: "Created",
                  render: (value) => new Date(value).toLocaleDateString()
                },
                { 
                  key: "engineer", 
                  label: "Assigned Engineer",
                  render: (value) => value ? `${value.email}` : "Not assigned"
                },
                { 
                  key: "attachments", 
                  label: "Attachments",
                  render: (attachments, row) => attachments && attachments.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openImageModal(attachments[0], `Complaint ${row.id} Attachment`)}
                        className="h-7 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View ({attachments.length})
                      </Button>
                      {attachments.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Show all attachments in modal
                            const attachmentUrls = attachments.map((url: string, index: number) => 
                              `${BASE_URL}${url}`
                            );
                            // For now, show first attachment, but you can enhance this to show a gallery
                            openImageModal(attachments[0], `Complaint ${row.id} Attachments`);
                          }}
                          className="h-7 px-2"
                        >
                          <ImageIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No attachments</span>
                  )
                }
              ]}
            />
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No complaints found for this user.</p>
            </div>
          )}
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
                alt={imageTitle || "Image"}
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
    </>
  );
});

ComplaintsTab.displayName = "ComplaintsTab";

export default ComplaintsTab;
