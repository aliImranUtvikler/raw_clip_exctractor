# Mjevo - Raw Clip Extractor

Mjevo is a high-performance web utility built with Next.js 15 to automate the splitting of long-form video files into individual raw clips for manual post-production. It uses FFmpeg for lossless, near-instant cutting.

## Features

- **Drag-and-Drop Video Upload**: Support for MP4/MOV files.
- **Smart Metadata Parsing**: accepts JSON, Kotlin data objects, and CSV formats.
- **Lossless Cutting**: Uses `ffmpeg -c copy` to preserve original quality.
- **Batch Processing**: Downloads all clips as a single ZIP file.

## Usage Guide

1.  **Start the Application**:
    Ensure the development server is running:
    ```bash
    npm run dev
    ```
    Navigate to `http://localhost:3000`.

2.  **Upload Source Video**:
    Drag and drop your source video file (MP4 or MOV) into the designated upload area ("Source Media").

3.  **Input Clip Parameters**:
    Paste your clip metadata into the text area. The application supports a simple CSV format.

    **Format Example (CSV):**
    ```text
    RR_Huberman_01_Phase1_Light, 00:02:42, 00:03:42
    RR_Huberman_02_Vertical_Alertness, 00:07:27, 00:09:03
    RR_Huberman_03_45_5_Rule, 00:10:43, 00:11:17
    ```
    *Format: `Filename, Start Time, End Time`*

4.  **Execute**:
    Click the "Execute Split" button. The server will process the file locally and automatically download a ZIP file containing your extracted clips.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
