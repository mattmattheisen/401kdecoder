import { NextResponse } from 'next/server';
import { parsePdfText, parseImageText } from '../../../lib/textExtract';
import { parseStatement } from '../../../lib/parseStatement';

export const runtime = 'nodejs';

export async function POST(req){
  const formData = await req.formData();
  const files = formData.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  let fullText = '';
  for (const f of files){
    const blob = await f.arrayBuffer();
    const type = f.type || '';
    if (type.includes('pdf')) {
      fullText += '\n' + await parsePdfText(Buffer.from(blob));
    } else if (type.startsWith('image/')) {
      fullText += '\n' + await parseImageText(Buffer.from(blob));
    }
  }

  const data = parseStatement(fullText);
  return NextResponse.json(data);
}
