import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const [planFilter, setPlanFilter] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers.filter((customer: any) => {
    if (planFilter === "with-plans") {
      return customer.serviceProvider;
    }
    if (planFilter === "without-plans") {
      return !customer.serviceProvider;
    }
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-yellow-600", "bg-red-600"];
    return colors[index % colors.length];
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (value: any, row: any, index: number) => (
        <div className="flex items-center">
          <div className={`h-10 w-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
            <span className="text-white font-medium text-sm">
              {getInitials(row.name)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">Customer ID: CU{row.id.toString().padStart(3, '0')}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (value: any, row: any) => (
        <div>
          <div className="text-sm text-gray-900">{row.phone}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: "planStatus",
      label: "Plan Status",
      render: (value: any, row: any) => (
        <StatusBadge status={row.serviceProvider ? "Active Plan" : "No Plan"} />
      ),
    },
    {
      key: "serviceProvider",
      label: "Service Provider",
      render: (value: string) => value || "-",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "lastActive",
      label: "Last Active",
      render: (value: any, row: any) => {
        // Calculate a mock last active time based on creation date
        const hours = Math.floor(Math.random() * 24) + 1;
        return `${hours} hours ago`;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
            View
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="User Management">
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="User Management">
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              User Management
            </CardTitle>
            <div className="flex space-x-2">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  <SelectItem value="with-plans">With Plans</SelectItem>
                  <SelectItem value="without-plans">Without Plans</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <DataTable
            data={filteredCustomers}
            columns={columns}
            searchPlaceholder="Search users..."
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
