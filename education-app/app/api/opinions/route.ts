import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OpinionSubmission } from '@/lib/types';
import Papa from 'papaparse';

// Path adjusted to go up one level from 'education-app' into 'data-analysis/data'
// process.cwd() is the root of the next.js app (education-app)
const DATA_FILE_PATH = path.join(process.cwd(), '..', 'data-analysis', 'data', 'opinions.csv');

// Helper to ensure CSV exists with headers
function ensureFile() {
  if (!fs.existsSync(path.dirname(DATA_FILE_PATH))) {
    fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE_PATH)) {
    fs.writeFileSync(DATA_FILE_PATH, 'id,timestamp,bestCountry,worstCountry\n');
  }
}

export async function GET() {
  try {
    ensureFile();
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    
    // Parse CSV
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('Error reading opinions:', error);
    return NextResponse.json({ error: 'Failed to read opinions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureFile();
    const body = await req.json();
    const { bestCountry, worstCountry } = body;

    if (!bestCountry || !worstCountry) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newSubmission: OpinionSubmission = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      bestCountry,
      worstCountry,
    };

    // Convert to CSV row using PapaParse
    const csvRow = Papa.unparse([newSubmission], { header: false, newline: '' }); // Don't include header for append
    
    // Append to file (add newline)
    fs.appendFileSync(DATA_FILE_PATH, '\n' + csvRow);

    return NextResponse.json(newSubmission);
  } catch (error) {
    console.error('Error saving opinion:', error);
    return NextResponse.json({ error: 'Failed to save opinion' }, { status: 500 });
  }
}
