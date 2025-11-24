'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Mail, Phone, Building2, User } from 'lucide-react';

interface SalesforceLead {
  Id: string;
  FirstName?: string;
  LastName: string;
  Company: string;
  Title?: string;
  Email?: string;
  Phone?: string;
  Status?: string;
  LeadSource?: string;
  CreatedDate?: string;
}

export default function SalesforceTestPage() {
  const [leads, setLeads] = useState<SalesforceLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Company: '',
    Email: '',
    Phone: '',
    Title: '',
    Status: 'Open - Not Contacted'
  });

  // Fetch leads from Salesforce
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/salesforce/leads?limit=20');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leads');
      }

      setLeads(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new lead
  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/salesforce/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create lead');
      }

      // Reset form
      setFormData({
        FirstName: '',
        LastName: '',
        Company: '',
        Email: '',
        Phone: '',
        Title: '',
        Status: 'Open - Not Contacted'
      });

      // Refresh leads list
      await fetchLeads();
      
      alert('Lead created successfully in Salesforce!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      console.error('Error creating lead:', err);
    } finally {
      setCreating(false);
    }
  };

  // Load leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Salesforce Integration Test
        </h1>
        <p className="text-muted-foreground">
          Test the connection between your Next.js app and Salesforce using REST API
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Lead Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Lead
            </CardTitle>
            <CardDescription>
              Create a new lead in Salesforce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.FirstName}
                    onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.LastName}
                    onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.Company}
                  onChange={(e) => setFormData({ ...formData, Company: e.target.value })}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.Title}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                  placeholder="CEO"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    placeholder="john@acme.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.Phone}
                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Lead in Salesforce'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Salesforce Leads</CardTitle>
                <CardDescription>
                  {leads.length} lead{leads.length !== 1 ? 's' : ''} from Salesforce
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchLeads}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No leads found in Salesforce</p>
                <p className="text-sm mt-1">Create one using the form</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {leads.map((lead) => (
                  <div
                    key={lead.Id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {lead.FirstName} {lead.LastName}
                        </h3>
                        {lead.Title && (
                          <p className="text-sm text-muted-foreground">{lead.Title}</p>
                        )}
                      </div>
                      {lead.Status && (
                        <Badge variant="secondary" className="text-xs">
                          {lead.Status}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>{lead.Company}</span>
                      </div>
                      {lead.Email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{lead.Email}</span>
                        </div>
                      )}
                      {lead.Phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.Phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                      ID: {lead.Id}
                      {lead.CreatedDate && (
                        <span className="ml-2">
                          • Created: {new Date(lead.CreatedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}














