"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { Check, AlertCircle } from "lucide-react";
import { RawClipMetadata } from "@/types";

interface MetadataInputProps {
    onMetadataChange: (data: RawClipMetadata[]) => void;
}

export function MetadataInput({ onMetadataChange }: MetadataInputProps) {
    const [text, setText] = useState("");
    const [parsed, setParsed] = useState<RawClipMetadata[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!text.trim()) {
            setParsed([]);
            onMetadataChange([]);
            setError(null);
            return;
        }

        try {
            const result = parseMetadata(text);
            if (result.length > 0) {
                setParsed(result);
                onMetadataChange(result);
                setError(null);
            } else {
                setParsed([]);
                onMetadataChange([]);
                setError("No valid clips found.");
            }
        } catch (e) {
            setParsed([]);
            onMetadataChange([]);
            setError("Invalid format.");
        }
    }, [text, onMetadataChange]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Output Metadata</Label>
                <Textarea
                    placeholder="Paste metadata here (JSON, CSV, or Kotlin calls)..."
                    className="min-h-[150px] font-mono text-sm bg-muted/50 resize-y"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Supported formats: JSON Array, CSV (Name, Start, End), or Kotlin data class calls.
                </p>
            </div>

            {(parsed.length > 0 || error) && (
                <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                {error ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        <span className="text-destructive">{error}</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{parsed.length} Clips Detecteds</span>
                                    </>
                                )}
                            </h3>
                        </div>

                        {parsed.length > 0 && (
                            <div className="max-h-[200px] overflow-y-auto space-y-2 text-sm">
                                {parsed.map((clip, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                                        <span className="col-span-6 font-medium truncate" title={clip.clipName}>{clip.clipName}</span>
                                        <span className="col-span-3 text-muted-foreground">{clip.startTime}</span>
                                        <span className="col-span-3 text-muted-foreground">{clip.endTime}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function parseMetadata(input: string): RawClipMetadata[] {
    // 1. Try JSON
    try {
        const json = JSON.parse(input);
        if (Array.isArray(json)) {
            // Basic validation
            return json.filter(i => i.clipName && i.startTime && i.endTime);
        }
    } catch (e) {
        // ignore
    }

    const lines = input.split("\n").filter(l => l.trim().length > 0);
    const results: RawClipMetadata[] = [];

    // Kotlin Regex: RawClipMetadata(clipName="foo", startTime="00:00", endTime="00:10")
    // Or: RawClipMetadata("foo", "00:00", "00:10")
    const kotlinRegex = /RawClipMetadata\s*\(\s*(?:clipName\s*=\s*)?"([^"]+)"\s*,\s*(?:startTime\s*=\s*)?"([^"]+)"\s*,\s*(?:endTime\s*=\s*)?"([^"]+)"\s*\)/;

    // CSV Regex: "Foo", "00:00", "00:10" or Foo, 00:00, 00:10
    // Simplistic CSV parser

    for (const line of lines) {
        // Try Kotlin
        const kMatch = line.match(kotlinRegex);
        if (kMatch) {
            results.push({
                clipName: kMatch[1],
                startTime: kMatch[2],
                endTime: kMatch[3]
            });
            continue;
        }

        // Try CSV
        const parts = line.split(/,|\t/).map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
            // Check if parts look like timestamps
            // Very basic heuristic
            if (parts[1].includes(":") && parts[2].includes(":")) {
                results.push({
                    clipName: parts[0],
                    startTime: parts[1],
                    endTime: parts[2]
                });
            }
        }
    }

    return results;
}
