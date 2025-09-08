import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Lead } from "@/lib/dummyData";

interface LeadsTabProps {
  leads: Lead[];
}

const LeadsTab = memo(({ leads }: LeadsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Related Leads ({leads.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <DataTable
            data={leads}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "source", label: "Source" },
              { key: "inquiryType", label: "Inquiry Type" },
              { 
                key: "status", 
                label: "Status",
                render: (value) => (
                  <Badge variant={value === "converted" ? "default" : "secondary"}>
                    {value}
                  </Badge>
                )
              },
              { 
                key: "createdAt", 
                label: "Created",
                render: (value) => new Date(value).toLocaleDateString()
              }
            ]}
          />
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No leads found for this user.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

LeadsTab.displayName = "LeadsTab";

export default LeadsTab;
