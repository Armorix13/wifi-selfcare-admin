import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Complaint } from "@/lib/dummyData";

interface ComplaintsTabProps {
  complaints: Complaint[];
}

const ComplaintsTab = memo(({ complaints }: ComplaintsTabProps) => {
  return (
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
              { key: "title", label: "Title" },
              { key: "priority", label: "Priority" },
              { 
                key: "status", 
                label: "Status",
                render: (value) => (
                  <Badge variant={value === "resolved" ? "default" : "secondary"}>
                    {value}
                  </Badge>
                )
              },
              { 
                key: "createdAt", 
                label: "Created",
                render: (value) => new Date(value).toLocaleDateString()
              },
              { key: "engineerName", label: "Assigned Engineer" }
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
  );
});

ComplaintsTab.displayName = "ComplaintsTab";

export default ComplaintsTab;
