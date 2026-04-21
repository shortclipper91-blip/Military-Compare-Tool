"use client";

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
}

export function ExportButton({ targetId, filename = "stratcom-briefing" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);
    
    try {
      // Add a temporary class for export styling if needed
      element.classList.add('exporting-briefing');
      
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#0f172a', // Match background
        style: {
          padding: '40px',
          borderRadius: '0px',
        }
      });

      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Briefing Exported",
        description: "Intelligence report has been saved to your device.",
      });
    } catch (err) {
      console.error('Export failed', err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate intelligence briefing image.",
      });
    } finally {
      element.classList.remove('exporting-briefing');
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={isExporting}
      className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 font-mono text-[10px] uppercase tracking-widest h-8"
    >
      {isExporting ? (
        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
      ) : (
        <Download className="w-3 h-3 mr-2" />
      )}
      {isExporting ? "Generating..." : "Export Briefing"}
    </Button>
  );
}