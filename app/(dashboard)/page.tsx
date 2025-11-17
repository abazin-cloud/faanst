import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users2, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Target,
  Activity,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { getLeads, getLeadsCount } from '@/lib/db';
import { AddLeadDialog } from './add-lead-dialog';

export default async function DashboardPage() {
  // Fetch real leads from database
  const leads = await getLeads(3); // Get top 3 leads
  const totalLeads = await getLeadsCount();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commercial Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your sales activities.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { account: 'Acme Corp', action: 'Placed new order', amount: '$2,450', time: '2 hours ago', type: 'order' },
                { account: 'TechStart Inc', action: 'Updated account info', time: '4 hours ago', type: 'update' },
                { account: 'GlobalTech Ltd', action: 'Request for quote', amount: '$5,200', time: '6 hours ago', type: 'quote' },
                { account: 'Design Studio', action: 'Payment received', amount: '$1,850', time: '1 day ago', type: 'payment' },
                { account: 'Innovation Labs', action: 'Meeting scheduled', time: '1 day ago', type: 'meeting' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{activity.account}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-medium">{activity.amount}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads & Quick Actions */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Leads</CardTitle>
              <CardDescription>Leads requiring attention</CardDescription>
            </div>
            <AddLeadDialog />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{lead.companyName}</p>
                        <Badge variant={
                          lead.status === 'hot' ? 'destructive' : 
                          lead.status === 'warm' ? 'default' : 
                          'secondary'
                        }>
                          {lead.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                    </div>
                    <p className="text-sm font-medium">${Number(lead.estimatedValue).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No leads yet.</p>
                  <p className="text-xs mt-1">Click "Add Lead" to get started!</p>
                </div>
              )}
              <Button className="w-full mt-4" variant="outline">
                View All Leads
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Product Catalog */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'ORD-001', customer: 'Acme Corp', amount: '$2,450', status: 'completed' },
                { id: 'ORD-002', customer: 'TechStart Inc', amount: '$1,890', status: 'processing' },
                { id: 'ORD-003', customer: 'GlobalTech Ltd', amount: '$3,200', status: 'pending' },
                { id: 'ORD-004', customer: 'Design Studio', amount: '$950', status: 'completed' },
              ].map((order, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">{order.amount}</p>
                    <Badge variant={
                      order.status === 'completed' ? 'default' : 
                      order.status === 'processing' ? 'secondary' : 
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Catalog Quick Access */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Quick access to products</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Electronics', count: 45, icon: Package },
                { name: 'Accessories', count: 32, icon: Package },
                { name: 'Services', count: 18, icon: Package },
                { name: 'Software', count: 24, icon: Package },
              ].map((category, i) => (
                <Button key={i} variant="outline" className="h-20 flex-col gap-1" asChild>
                  <Link href="#">
                    <category.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">{category.count} items</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Accounts</CardTitle>
            <CardDescription>Your highest-value customer accounts</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Acme Corporation', revenue: '$45,231', orders: 23, status: 'active' },
              { name: 'TechStart Industries', revenue: '$32,450', orders: 18, status: 'active' },
              { name: 'GlobalTech Limited', revenue: '$28,900', orders: 15, status: 'active' },
              { name: 'Innovation Labs', revenue: '$22,100', orders: 12, status: 'active' },
              { name: 'Design Studio Pro', revenue: '$18,750', orders: 9, status: 'active' },
            ].map((account, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.orders} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">{account.revenue}</p>
                  <Badge>{account.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}