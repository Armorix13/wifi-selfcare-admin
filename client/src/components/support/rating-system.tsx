import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Star, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Download
} from "lucide-react";
import { format } from "date-fns";

interface Rating {
  id: number;
  ticketId: number;
  customerName: string;
  customerEmail: string;
  rating: number;
  feedback: string;
  category: string;
  engineerName?: string;
  createdAt: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

interface RatingSystemProps {
  ratings: Rating[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export function RatingSystem({
  ratings,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage
}: RatingSystemProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const filteredRatings = ratings.filter((rating) => {
    const matchesSearch = 
      rating.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.engineerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = filterRating === "all" || rating.rating.toString() === filterRating;
    const matchesCategory = filterCategory === "all" || rating.category === filterCategory;

    return matchesSearch && matchesRating && matchesCategory;
  });

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "most-helpful":
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-500", "bg-purple-500", "bg-green-500", 
      "bg-yellow-500", "bg-red-500", "bg-indigo-500",
      "bg-pink-500", "bg-orange-500"
    ];
    return colors[index % colors.length];
  };

  // Calculate analytics
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

  const ratingDistribution = [
    { stars: 5, count: ratings.filter(r => r.rating === 5).length },
    { stars: 4, count: ratings.filter(r => r.rating === 4).length },
    { stars: 3, count: ratings.filter(r => r.rating === 3).length },
    { stars: 2, count: ratings.filter(r => r.rating === 2).length },
    { stars: 1, count: ratings.filter(r => r.rating === 1).length },
  ];

  const totalRatings = ratings.length;
  const positiveRatings = ratings.filter(r => r.rating >= 4).length;
  const satisfactionRate = totalRatings > 0 ? (positiveRatings / totalRatings) * 100 : 0;

  const PaginationControls = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, sortedRatings.length);

    return (
      <div className="flex items-center justify-between py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {sortedRatings.length} ratings
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-yellow-200 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-yellow-700">
              <Star className="h-4 w-4 mr-2" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-yellow-900">{averageRating.toFixed(1)}</span>
              {renderStars(Math.floor(averageRating), "sm")}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Based on {totalRatings} reviews</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-green-700">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{satisfactionRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">{positiveRatings} of {totalRatings} positive</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-blue-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalRatings}</div>
            <p className="text-xs text-blue-600 mt-1">Customer feedback</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium text-purple-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">+5.2%</div>
            <p className="text-xs text-purple-600 mt-1">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map((item) => {
              const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
              return (
                <div key={item.stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{item.stars}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">
                    {item.count}
                  </div>
                  <div className="text-xs text-muted-foreground w-12 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Customer Reviews & Ratings
              <Badge variant="outline" className="ml-2">
                {sortedRatings.length} reviews
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="most-helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sortedRatings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No reviews found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              sortedRatings.map((rating, index) => (
                <div key={rating.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-white font-semibold ${getAvatarColor(index)}`}>
                          {getInitials(rating.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-foreground">{rating.customerName}</h4>
                            <div className="flex items-center space-x-1">
                              {renderStars(rating.rating)}
                              <span className="text-sm font-medium ml-1">{rating.rating}.0</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {rating.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Ticket #{rating.ticketId}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(rating.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>

                        {/* Feedback */}
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          "{rating.feedback}"
                        </p>

                        {/* Tags */}
                        {rating.tags && rating.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {rating.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            {rating.engineerName && (
                              <span>Engineer: {rating.engineerName}</span>
                            )}
                            <span>Customer: {rating.customerEmail}</span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{rating.helpful}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{rating.notHelpful}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRating(rating)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <span>Review Details</span>
                            <div className="flex items-center space-x-1">
                              {renderStars(rating.rating)}
                              <span className="text-sm ml-1">{rating.rating}.0</span>
                            </div>
                          </DialogTitle>
                          <DialogDescription>
                            Review for Ticket #{rating.ticketId}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <label className="text-sm font-medium">Customer</label>
                              <p className="text-sm">{rating.customerName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-sm">{rating.customerEmail}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Category</label>
                              <p className="text-sm">{rating.category}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Engineer</label>
                              <p className="text-sm">{rating.engineerName || "N/A"}</p>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Feedback</label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded-lg">
                              "{rating.feedback}"
                            </p>
                          </div>

                          {rating.tags && rating.tags.length > 0 && (
                            <div>
                              <label className="text-sm font-medium">Tags</label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rating.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              Submitted on {format(new Date(rating.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                            </div>
                            <div className="flex items-center space-x-3">
                              <button className="flex items-center space-x-1 text-sm hover:text-green-600 transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{rating.helpful} helpful</span>
                              </button>
                              <button className="flex items-center space-x-1 text-sm hover:text-red-600 transition-colors">
                                <ThumbsDown className="h-4 w-4" />
                                <span>{rating.notHelpful} not helpful</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {sortedRatings.length > 0 && <PaginationControls />}
        </CardContent>
      </Card>
    </div>
  );
}