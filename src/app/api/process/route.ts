import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import JSZip from "jszip";
import { RawClipMetadata } from "@/types";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const metadataJson = formData.get("metadata") as string | null;

    if (!file || !metadataJson) {
        return NextResponse.json({ success: false, message: "Missing file or metadata" }, { status: 400 });
    }

    const metadata: RawClipMetadata[] = JSON.parse(metadataJson);

    // Setup temp directory
    const sessionId = uuidv4();
    const tempDir = join(tmpdir(), "raw-clip-extractor", sessionId);
    await mkdir(tempDir, { recursive: true });

    const inputFilePath = join(tempDir, `original_${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(inputFilePath, Buffer.from(arrayBuffer));

    const processingPromises: Promise<{ path: string; name: string }>[] = [];

    for (const clip of metadata) {
        const safeName = clip.clipName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const outputFilename = `${safeName}.mp4`; // Assuming mp4 input/output for now, or detect ext
        const outputPath = join(tempDir, outputFilename);

        const p = new Promise<{ path: string; name: string }>((resolve, reject) => {
            ffmpeg()
                .input(inputFilePath)
                // using inputOptions to force -ss and -to BEFORE -i (as requested and for speed)
                .inputOptions([`-ss ${clip.startTime}`, `-to ${clip.endTime}`])
                .outputOptions(["-c copy"])
                .output(outputPath)
                .on("end", () => resolve({ path: outputPath, name: outputFilename }))
                .on("error", (err) => {
                    console.error(`Error processing ${clip.clipName}:`, err);
                    reject(err);
                })
                .run();
        });
        processingPromises.push(p);
    }

    try {
        const results = await Promise.all(processingPromises);

        // ZIP creation
        const zip = new JSZip();
        for (const res of results) {
            const fileData = await readFile(res.path);
            zip.file(res.name, fileData);
        }

        const zipContent = await zip.generateAsync({ type: "nodebuffer" });

        // Cleanup
        await Promise.all([
            unlink(inputFilePath),
            ...results.map(r => unlink(r.path))
        ]);

        // Cast buffer to any or compatible type for NextResponse
        return new NextResponse(zipContent as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="clips_${sessionId}.zip"`,
            },
        });

    } catch (error) {
        console.error("Processing failed", error);
        return NextResponse.json({ success: false, message: "Processing failed" }, { status: 500 });
    }
}
