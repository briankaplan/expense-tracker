'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type Subscription } from '@/types/subscriptions';
import { Plus, Calendar, Bell, CreditCard, Filter, Search, Sparkles } from 'lucide-react';
import { SubscriptionDialog } from './SubscriptionDialog';
import { useSubscriptionIntelligence } from '@/lib/hooks/useSubscriptionIntelligence';
import { SubscriptionNotifications } from './SubscriptionNotifications';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SubscriptionLogo } from '@/components/ui/subscription-logo';
import { SubscriptionCard } from './SubscriptionCard';
import { AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
  { label: 'Software', value: 'software' },
  { label: 'Streaming', value: 'streaming' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Memberships', value: 'memberships' },
  { label: 'Other', value: 'other' },
] as const;

const FREQUENCIES = [
  { label: 'All Frequencies', value: 'all' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
] as const;

const STATUSES = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active Only', value: 'active' },
] as const;

export function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<typeof CATEGORIES[number]['value']>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<typeof FREQUENCIES[number]['value']>('all');
  const [statusFilter, setStatusFilter] = useState<typeof STATUSES[number]['value']>('all');

  const {
    isAnalyzing,
    analysis,
    analyzeSubscriptions,
    findAlternatives,
  } = useSubscriptionIntelligence({
    subscriptions,
    onUpdate: () => {
      // Refresh data if needed
    },
  });

  // Calculate totals
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    switch (sub.frequency) {
      case 'monthly':
        return sum + sub.amount;
      case 'yearly':
        return sum + (sub.amount / 12);
      case 'quarterly':
        return sum + (sub.amount / 3);
      case 'weekly':
        return sum + (sub.amount * 4.33);
      default:
        return sum;
    }
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = searchQuery === '' ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesFrequency = frequencyFilter === 'all' || sub.frequency === frequencyFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesFrequency && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => analyzeSubscriptions()}
            disabled={isAnalyzing}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Savings'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <SubscriptionNotifications subscriptions={subscriptions} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(yearlyTotal)} yearly
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analysis?.optimizations
                ? formatCurrency(
                    analysis.optimizations.recommendations.reduce(
                      (sum, rec) => sum + rec.potentialSavings,
                      0
                    )
                  )
                : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analysis?.renewalRisks.filter(risk => risk.riskLevel === 'high').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">high priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Panel */}
      {analysis && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Subscription Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {/* Optimization Recommendations */}
              <AccordionItem value="recommendations">
                <AccordionTrigger>
                  Optimization Recommendations
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {analysis.optimizations.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-4 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium">{rec.description}</p>
                          <Badge variant={
                            rec.impact === 'high' ? 'destructive' :
                            rec.impact === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            Save {formatCurrency(rec.potentialSavings)}/mo
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Renewal Risks */}
              <AccordionItem value="risks">
                <AccordionTrigger>
                  Upcoming Renewals & Risks
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {analysis.renewalRisks.map((risk, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-4 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium">{risk.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {risk.suggestedAction}
                          </p>
                          {risk.deadline && (
                            <p className="text-sm text-muted-foreground">
                              Deadline: {formatDate(risk.deadline)}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          risk.riskLevel === 'high' ? 'destructive' :
                          risk.riskLevel === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {risk.riskLevel} risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Overlapping Services */}
              {analysis.optimizations.overlapingServices.length > 0 && (
                <AccordionItem value="overlapping">
                  <AccordionTrigger>
                    Overlapping Services
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {analysis.optimizations.overlapingServices.map((overlap, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-muted"
                        >
                          <p className="font-medium">{overlap.description}</p>
                          <div className="flex gap-2 mt-2">
                            {overlap.services.map((service, serviceIdx) => (
                              <Badge key={serviceIdx} variant="secondary">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-green-600 mt-2">
                            Potential savings: {formatCurrency(overlap.potentialSavings)}/mo
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map(frequency => (
              <SelectItem key={frequency.value} value={frequency.value}>
                {frequency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subscription List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={setSelectedSubscription}
              onFindAlternatives={findAlternatives}
            />
          ))}
          {filteredSubscriptions.length === 0 && (
            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <div className="text-muted-foreground mb-4">
                No subscriptions found
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subscription
              </Button>
            </Card>
          )}
        </div>
      </AnimatePresence>

      {/* Dialogs */}
      <SubscriptionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        subscription={selectedSubscription}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
} 