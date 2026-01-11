"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { MetadataInput } from "@/components/metadata-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Download, AlertTriangle } from "lucide-react";
import { RawClipMetadata } from "@/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<RawClipMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [progress, setProgress] = useState(0); // Fake progress?
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleProcess = async () => {
    if (!file || metadata.length === 0) return;

    setIsProcessing(true);
    setStatus("processing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed on server.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clips_${new Date().getTime()}.zip`; // Server sends filename too, but fallback
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("done");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please check your inputs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-8 md:p-12 lg:p-24 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            Mjevo
          </h1>
          <p className="text-muted-foreground text-lg uppercase tracking-widest font-light">
            Raw Clip Extractor
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Upload */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-sm flex items-center justify-center text-sm">1</span>
              Source Media
            </h2>
            <FileUpload onFileSelect={setFile} />
          </section>

          {/* Step 2: Metadata */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-sm flex items-center justify-center text-sm">2</span>
              Parameters
            </h2>
            <MetadataInput onMetadataChange={setMetadata} />
          </section>

          {/* Step 3: Action */}
          <section className="pt-4">
            <Button
              size="lg"
              className="w-full text-lg font-bold uppercase tracking-widest h-14"
              onClick={handleProcess}
              disabled={!file || metadata.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" /> Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" /> Execute Split
                </>
              )}
            </Button>
          </section>
        </div>

        {/* Status */}
        {status === "done" && (
          <Card className="border-green-500/50 bg-green-500/10 p-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <Download className="w-12 h-12 text-green-500 mb-2" />
            <h3 className="text-xl font-bold text-green-500">Operation Successful</h3>
            <p className="text-muted-foreground">Your clips have been downloaded.</p>
            <Button variant="link" onClick={() => setStatus("idle")} className="mt-2 text-green-400">
              Reset
            </Button>
          </Card>
        )}

        {status === "error" && (
          <Card className="border-destructive/50 bg-destructive/10 p-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <AlertTriangle className="w-12 h-12 text-destructive mb-2" />
            <h3 className="text-xl font-bold text-destructive">System Failure</h3>
            <p className="text-muted-foreground">{errorMessage}</p>
          </Card>
        )}

      </div>
    </main>
  );
}
