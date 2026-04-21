"use client";

import React from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { Download, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportBriefingProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename?: string;
}

export function ExportBriefing({ targetRef, filename = "stratcom-briefing.png" }: ExportBriefingProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!targetRef.current) return;

    setIsExporting(true);
    const toastId = toast.loading("Generating Intelligence Briefing...");

    try {
      // Small delay to ensure UI is settled
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        backgroundColor: "#0f172a", // Match background color
        style: {
          padding: "20px",
          borderRadius: "0px",
        },
      });

      saveAs(dataUrl, filename);
      toast.success("Briefing exported successfully", { id: toastId });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate briefing", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-[0.2em] h-10 gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3" />
      )}
      {isExporting ? "Processing..." : "Export Intel Briefing"}
    </Button>
  );
}