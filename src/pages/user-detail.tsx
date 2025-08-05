import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Wifi, CreditCard, Settings, MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react';
import { dummyCustomers, dummyComplaints } from '@/lib/dummyData';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function UserDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const userId = params?.id ? parseInt(params.id) : null;
  
  const user = userId ? dummyCustomers.find(u => u.id === userId) : null;
  const userComplaints = userId ? dummyComplaints.filter(c => c.customerId === userId) : [];

  if (!user) {
    return (
      <MainLayout title="User Not Found">
        <div className="p-8 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/users')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <MainLayout title={`${user.name} - User Details`}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Customer Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <div className="flex justify-center">
                  <Badge className={cn("capitalize", getStatusColor(user.status))}>
                    {user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium">{user.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.serviceProvider ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Service Provider</p>
                      <p className="font-medium">{user.serviceProvider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                      <p className="font-medium">{user.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Static IP</p>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {user.staticIp || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">MAC Address</p>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {user.macAddress || 'Not available'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Wifi className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No active service</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance Due</p>
                  <p className={cn(
                    "font-bold text-lg",
                    user.balanceDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  )}>
                    ₹{user.balanceDue.toLocaleString()}
                  </p>
                </div>
                {user.activationDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activation Date</p>
                    <p className="font-medium">{new Date(user.activationDate).toLocaleDateString()}</p>
                  </div>
                )}
                {user.expirationDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expiration Date</p>
                    <p className="font-medium">{new Date(user.expirationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Complaints */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Complaints</span>
                  <Badge variant="secondary">{userComplaints.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userComplaints.length > 0 ? (
                  <div className="space-y-4">
                    {userComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{complaint.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={cn("text-xs", getPriorityColor(complaint.priority))}>
                              {complaint.priority}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(complaint.status))}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                          {complaint.engineerName && (
                            <span>Assigned to: {complaint.engineerName}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Complaints</h3>
                    <p className="text-gray-600 dark:text-gray-400">This user hasn't filed any complaints yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}