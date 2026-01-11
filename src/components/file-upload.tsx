"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileVideo, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("video/")) {
                    setSelectedFile(file);
                    onFileSelect(file);
                } else {
                    alert("Please upload a video file.");
                }
            }
        },
        [onFileSelect]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <Card
            className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed transition-colors duration-200 ease-in-out cursor-pointer",
                dragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary/50",
                selectedFile ? "border-solid border-primary" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="video/*"
                onChange={handleChange}
            />

            {selectedFile ? (
                <div className="flex flex-col items-center gap-4 p-6">
                    <div className="flex items-center gap-2 p-3 rounded-full bg-primary/20">
                        <FileVideo className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                        }}
                    >
                        Remove Video
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                    <div className="p-4 rounded-full bg-muted">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">Drop video here</p>
                        <p className="text-sm text-muted-foreground">
                            or click to browse
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        MP4, MOV supported
                    </p>
                </div>
            )}
        </Card>
    );
}
