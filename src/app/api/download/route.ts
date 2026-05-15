import { readFile, stat } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const ZIP_PATH = path.join(process.cwd(), 'public', 'mitra-jasa-pro-latest.zip');

export async function GET() {
  try {
    await stat(ZIP_PATH);
    const fileBuffer = await readFile(ZIP_PATH);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="mitra-jasa-pro-latest.zip"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
