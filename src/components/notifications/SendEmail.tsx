import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, Mail, Send, Clock } from 'lucide-react';

// Utility functions for timezone handling
const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const convertLocalToUTC = (localDateTime: string): string => {
  if (!localDateTime) return '';
  
  // Create a date object from the local datetime string
  const localDate = new Date(localDateTime);
  
  // Return ISO string which is in UTC
  return localDate.toISOString();
};

const getMinDateTime = (): string => {
  // Get current time and add 1 minute to ensure future scheduling
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  return formatDateForInput(now);
};

const formatTimeZoneDisplay = (): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const timeZoneOffset = now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timeZoneOffset) / 60);
  const offsetMinutes = Math.abs(timeZoneOffset) % 60;
  const offsetSign = timeZoneOffset <= 0 ? '+' : '-';
  
  return `${timeZone} (UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')})`;
};

const SEND_EMAIL_API_URL = import.meta.env.VITE_NOTIFICATION_SEND_EMAIL_API_URL;
const SEND_BULK_EMAIL_API_URL = import.meta.env.VITE_NOTIFICATION_SEND_BULK_EMAIL_API_URL;

const defaultSingle = {
  recipientEmail: '',
  recipientName: '',
  subject: '',
  content: '',
  htmlContent: '',
  priority: 'normal',
  scheduledAt: '',
  metadata: '',
  campaignId: '',
};

const defaultBulk = {
  recipientEmails: '', // comma or newline separated
  subject: '',
  content: '',
  htmlContent: '',
  priority: 'normal',
  scheduledAt: '',
  metadata: '',
  campaignId: '',
};

export default function SendEmail() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [single, setSingle] = useState(defaultSingle);
  const [bulk, setBulk] = useState(defaultBulk);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);

  type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  const handleChange = (e: InputChangeEvent, isBulk = false) => {
    const { name, value } = e.target;
    if (isBulk) setBulk((b) => ({ ...b, [name]: value }));
    else setSingle((s) => ({ ...s, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string, isBulk = false) => {
    if (isBulk) setBulk((b) => ({ ...b, [field]: value }));
    else setSingle((s) => ({ ...s, [field]: value }));
  };

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (!checked) {
      // Clear the scheduled time when toggling off
      setSingle((s) => ({ ...s, scheduledAt: '' }));
      setBulk((b) => ({ ...b, scheduledAt: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let url = '';
      let body: Record<string, unknown> = {};
      
      if (mode === 'single') {
        url = SEND_EMAIL_API_URL;
        const { scheduledAt, metadata, ...otherFields } = single;
        
        // Validate scheduled time if provided (compare in local time)
        if (scheduledAt) {
          const scheduledDate = new Date(scheduledAt);
          const now = new Date();
          
          if (scheduledDate <= now) {
            setResult({ 
              success: false, 
              message: 'Scheduled time must be in the future' 
            });
            setLoading(false);
            return;
          }
        }
        
        body = {
          ...otherFields,
          // Convert to UTC and only include scheduledAt if it has a value
          ...(scheduledAt && { scheduledAt: convertLocalToUTC(scheduledAt) }),
          // Only include metadata if it has a value and is valid JSON
          ...(metadata && (() => {
            try {
              return { metadata: JSON.parse(metadata) };
            } catch {
              throw new Error('Invalid JSON format in metadata field');
            }
          })()),
        };
      } else {
        url = SEND_BULK_EMAIL_API_URL;
        const emails = bulk.recipientEmails
          .split(/[,\n]/)
          .map((e) => e.trim())
          .filter(Boolean);
          
        const { scheduledAt, metadata, ...otherFields } = bulk;
        
        // Validate scheduled time if provided (compare in local time)
        if (scheduledAt) {
          const scheduledDate = new Date(scheduledAt);
          const now = new Date();
          
          if (scheduledDate <= now) {
            setResult({ 
              success: false, 
              message: 'Scheduled time must be in the future' 
            });
            setLoading(false);
            return;
          }
        }
        
        body = {
          ...otherFields,
          recipientEmails: emails,
          // Convert to UTC and only include scheduledAt if it has a value
          ...(scheduledAt && { scheduledAt: convertLocalToUTC(scheduledAt) }),
          // Only include metadata if it has a value and is valid JSON
          ...(metadata && (() => {
            try {
              return { metadata: JSON.parse(metadata) };
            } catch {
              throw new Error('Invalid JSON format in metadata field');
            }
          })()),
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        const currentData = mode === 'single' ? single : bulk;
        const successMessage = currentData.scheduledAt 
          ? data.message || 'Email scheduled successfully!' 
          : data.message || 'Email sent successfully!';
        setResult({ success: true, message: successMessage });
        if (mode === 'single') setSingle(defaultSingle);
        else setBulk(defaultBulk);
        setIsScheduled(false); // Reset scheduling toggle
      } else {
        setResult({ success: false, message: data.message || 'Failed to send email' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
        <p className="text-muted-foreground">
          Send single emails or bulk email campaigns to users
        </p>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`flex items-center gap-2 p-4 rounded-md border ${
          result.success 
            ? 'text-green-600 bg-green-50 border-green-200' 
            : 'text-red-600 bg-red-50 border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaign
          </CardTitle>
          <CardDescription>
            Choose between sending a single email or bulk email campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'single' | 'bulk')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Email</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Email</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                    <Input
                      id="recipientEmail"
                      name="recipientEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={single.recipientEmail}
                      onChange={(e) => handleChange(e)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      name="recipientName"
                      placeholder="John Doe"
                      value={single.recipientName}
                      onChange={(e) => handleChange(e)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmails">Recipient Emails *</Label>
                  <Textarea
                    id="recipientEmails"
                    name="recipientEmails"
                    placeholder="Enter email addresses separated by commas or new lines"
                    value={bulk.recipientEmails}
                    onChange={(e) => handleChange(e, true)}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple emails with commas or new lines
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Common Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Email subject"
                  value={mode === 'single' ? single.subject : bulk.subject}
                  onChange={(e) => handleChange(e, mode === 'bulk')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Email content (plain text)"
                  value={mode === 'single' ? single.content : bulk.content}
                  onChange={(e) => handleChange(e, mode === 'bulk')}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content (Optional)</Label>
                <Textarea
                  id="htmlContent"
                  name="htmlContent"
                  placeholder="<h1>HTML content</h1>"
                  value={mode === 'single' ? single.htmlContent : bulk.htmlContent}
                  onChange={(e) => handleChange(e, mode === 'bulk')}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={mode === 'single' ? single.priority : bulk.priority}
                    onValueChange={(value) => handleSelectChange(value, 'priority', mode === 'bulk')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule-email"
                      checked={isScheduled}
                      onCheckedChange={handleScheduleToggle}
                    />
                    <Label htmlFor="schedule-email" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule for later
                    </Label>
                  </div>
                  {isScheduled && (
                    <div className="space-y-1">
                      <Input
                        id="scheduledAt"
                        name="scheduledAt"
                        type="datetime-local"
                        value={mode === 'single' ? single.scheduledAt : bulk.scheduledAt}
                        onChange={(e) => handleChange(e, mode === 'bulk')}
                        min={getMinDateTime()}
                        required={isScheduled}
                      />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Email will be sent at the specified time ({formatTimeZoneDisplay()})
                        </p>
                        {(mode === 'single' ? single.scheduledAt : bulk.scheduledAt) && (
                          <p className="text-xs text-muted-foreground">
                            UTC time: {new Date(mode === 'single' ? single.scheduledAt : bulk.scheduledAt).toISOString().replace('T', ' ').slice(0, 19)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaignId">Campaign ID (Optional)</Label>
                  <Input
                    id="campaignId"
                    name="campaignId"
                    placeholder="campaign-2024-01"
                    value={mode === 'single' ? single.campaignId : bulk.campaignId}
                    onChange={(e) => handleChange(e, mode === 'bulk')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata (JSON, Optional)</Label>
                <Textarea
                  id="metadata"
                  name="metadata"
                  placeholder='{"key": "value"}'
                  value={mode === 'single' ? single.metadata : bulk.metadata}
                  onChange={(e) => handleChange(e, mode === 'bulk')}
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {isScheduled ? (
                <Clock className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading 
                ? 'Processing...' 
                : isScheduled 
                  ? `Schedule ${mode === 'single' ? 'Email' : 'Bulk Emails'}` 
                  : `Send ${mode === 'single' ? 'Email' : 'Bulk Emails'} Now`
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
