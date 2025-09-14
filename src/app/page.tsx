'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { getSanitizedTextAction } from './actions';

const formSchema = z.object({
  text: z.string().min(1, 'Please enter some text to sanitize'),
  sanitizationRequest: z.string().min(1, 'Please describe what you want to sanitize'),
  sampleDataset: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const sampleDatasets = [
  {
    value: 'pii_sample',
    label: 'Personal Information (PII)',
    text: `Hi John Doe! Thanks for contacting us. Your email john.doe@email.com has been registered. 
Please call us at +1-555-123-4567 or visit us at 123 Main Street, New York, NY 10001. 
Born: 05/15/1985, SSN: 123-45-6789`,
    intent: 'Remove all personal identifiable information'
  },
  {
    value: 'financial_sample',
    label: 'Financial Information',
    text: `Payment processed successfully! 
Credit Card: 4532-1234-5678-9012 (Expires: 12/25, CVV: 123)
IBAN: GB29 NWBK 6016 1331 9268 19
Bitcoin Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Account: 12345678901234`,
    intent: 'Redact all financial information and payment details'
  },
  {
    value: 'sensitive_sample',
    label: 'Sensitive Data',
    text: `Database connection string: mongodb://admin:super_secret_password@db.example.com:27017/myapp
API Key: sk-1234567890abcdef1234567890abcdef
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SSH Key: ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...`,
    intent: 'Remove all passwords, API keys, and sensitive credentials'
  },
];

const progressSteps = {
  mcp_connect_start: { label: 'Connecting to MCP server...', progress: 10 },
  mcp_connect_finish: { label: 'Connected to MCP server', progress: 25 },
  list_tools: { label: 'Loading available sanitization tools...', progress: 40 },
  select_tool: { label: 'AI selecting appropriate tool...', progress: 60 },
  tool_exec_start: { label: 'Executing sanitization...', progress: 80 },
  tool_exec_finish: { label: 'Sanitization complete!', progress: 100 },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<{ sanitizedText: string; toolUsed: string } | null>(null);
  const [rawOutput, setRawOutput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      sanitizationRequest: '',
      sampleDataset: '',
    },
  });

  const selectedDataset = watch('sampleDataset');

  const onSampleDatasetChange = (value: string) => {
    const dataset = sampleDatasets.find(d => d.value === value);
    if (dataset) {
      setValue('text', dataset.text);
      setValue('sanitizationRequest', dataset.intent);
      setValue('sampleDataset', value);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setProgress(25);
    setCurrentStep('Processing your request...');
    setResult(null);
    setRawOutput('');

    try {
      setProgress(50);
      setCurrentStep('AI analyzing text and selecting appropriate tool...');
      
      const response = await getSanitizedTextAction({
        text: data.text,
        sanitizationRequest: data.sanitizationRequest,
      });

      setRawOutput(JSON.stringify(response, null, 2));

      if (response.success) {
        setResult(response.data);
        setProgress(100);
        setCurrentStep('Sanitization complete!');
      } else {
        setCurrentStep(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error during sanitization:', error);
      setCurrentStep(`Error: ${error}`);
      setRawOutput(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-background p-4 relative overflow-hidden">
      {/* Ambient lighting effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Shield className="h-12 w-12 text-primary neon-glow" />
              <div className="absolute inset-0 h-12 w-12 text-primary animate-ping opacity-20">
                <Shield className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              SanitizeAI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-mono tracking-wide">
            &gt; AI-powered sensitive data sanitization using Model Context Protocol
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-md">
            <span className="text-primary font-mono text-sm">[ MCP PROTOCOL ACTIVE ]</span>
          </div>
        </div>

        <div className="cyber-card rounded-xl shadow-2xl p-8 cyber-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="sample-dataset" className="text-primary font-mono text-sm uppercase tracking-wider">
                &gt; Quick Start Protocol
              </Label>
              <Select value={selectedDataset} onValueChange={onSampleDatasetChange}>
                <SelectTrigger className="cyber-input h-12">
                  <SelectValue placeholder="[ SELECT DATASET TEMPLATE ]" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  {sampleDatasets.map((dataset) => (
                    <SelectItem key={dataset.value} value={dataset.value} className="hover:bg-primary/10">
                      <span className="font-mono">{dataset.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="text" className="text-primary font-mono text-sm uppercase tracking-wider">
                &gt; Target Data Input
              </Label>
              <Textarea
                id="text"
                placeholder="[ PASTE SENSITIVE DATA FOR PROCESSING ]"
                className="min-h-[180px] cyber-input font-mono text-sm"
                {...register('text')}
              />
              {errors.text && (
                <p className="text-destructive text-sm font-mono">! {errors.text.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="sanitization-request" className="text-primary font-mono text-sm uppercase tracking-wider">
                &gt; Sanitization Protocol
              </Label>
              <Input
                id="sanitization-request"
                placeholder="[ DESCRIBE SANITIZATION METHOD ]"
                className="cyber-input h-12 font-mono"
                {...register('sanitizationRequest')}
              />
              {errors.sanitizationRequest && (
                <p className="text-destructive text-sm font-mono">! {errors.sanitizationRequest.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 cyber-button font-mono text-lg uppercase tracking-wider relative group"
            >
              <span className="relative z-10">
                {isLoading ? '[ PROCESSING... ]' : '[ INITIATE SANITIZATION ]'}
              </span>
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse" />
              )}
            </Button>
          </form>

          {isLoading && (
            <div className="mt-8 space-y-4 p-6 bg-secondary/20 border border-primary/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-primary font-mono text-sm uppercase tracking-wide">
                  {currentStep}
                </span>
                <span className="text-accent font-mono text-sm">
                  {progress}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="w-full h-2 bg-secondary/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse opacity-50" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>NEURAL NETWORK PROCESSING...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <Tabs defaultValue="result" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/30 border-primary/20">
                  <TabsTrigger value="result" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    [ OUTPUT DATA ]
                  </TabsTrigger>
                  <TabsTrigger value="details" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    [ SYSTEM LOGS ]
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="result" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-mono text-primary uppercase tracking-wider">
                        &gt; Sanitized Output
                      </h3>
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded border border-primary/30 font-mono">
                        PROTOCOL: {result.toolUsed}
                      </span>
                    </div>
                    <div className="bg-secondary/20 p-6 rounded-lg border border-primary/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
                      <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed">
                        {result.sanitizedText}
                      </pre>
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground font-mono">
                        [ CLASSIFIED ]
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-mono text-primary uppercase tracking-wider">
                        &gt; Process Analytics
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="cyber-button font-mono text-xs">
                            <Eye className="h-4 w-4 mr-2" />
                            [ RAW DATA ]
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto bg-card border-border/50">
                          <DialogHeader>
                            <DialogTitle className="font-mono text-primary">SYSTEM RAW OUTPUT</DialogTitle>
                            <DialogDescription className="font-mono text-muted-foreground">
                              &gt; Technical process execution logs
                            </DialogDescription>
                          </DialogHeader>
                          <pre className="text-xs bg-secondary/20 p-4 rounded overflow-x-auto font-mono border border-primary/20">
                            {rawOutput}
                          </pre>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid gap-4">
                      <div className="bg-primary/10 p-4 rounded border border-primary/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="font-mono text-primary text-sm uppercase tracking-wider">✓ MCP CONNECTION</div>
                        <div className="text-sm text-muted-foreground font-mono">localhost:9003 // ACTIVE</div>
                      </div>
                      <div className="bg-accent/10 p-4 rounded border border-accent/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                        <div className="font-mono text-accent text-sm uppercase tracking-wider">🔧 NEURAL SELECTION</div>
                        <div className="text-sm text-muted-foreground font-mono">ALGORITHM: {result.toolUsed}</div>
                      </div>
                      <div className="bg-secondary/20 p-4 rounded border border-border/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-foreground" />
                        <div className="font-mono text-foreground text-sm uppercase tracking-wider">🛡️ SECURITY STATUS</div>
                        <div className="text-sm text-muted-foreground font-mono">DATA SANITIZED // COMPLETE</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <div className="mt-12 text-center border-t border-primary/20 pt-8">
          <div className="space-y-2">
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              &gt; SYSTEM ARCHITECTURE
            </p>
            <p className="text-xs text-muted-foreground font-mono max-w-2xl mx-auto leading-relaxed">
              [ MODEL_CONTEXT_PROTOCOL ] :: AI_LOGIC(GENKIT+NEXTJS) &lt;--&gt; TOOLS(MCP_SERVER)
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>CLIENT ACTIVE</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>SERVER ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}