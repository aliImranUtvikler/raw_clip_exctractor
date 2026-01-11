export interface RawClipMetadata {
  clipName: string;
  startTime: string; // "HH:MM:SS" or "MM:SS"
  endTime: string;   // "HH:MM:SS" or "MM:SS"
}

export interface ProcessResponse {
  success: boolean;
  message?: string;
  downloadUrl?: string; // If we were storing it, but we might just return the blob directly
}
