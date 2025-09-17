import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Next.js edge/serverless note: use bundled worker.
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

export async function parsePdfText(buffer){
  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += '\n' + content.items.map(it => it.str).join(' ');
  }
  return text;
}

export async function parseImageText(buffer){
  // Optional OCR. If bundle size/time is a concern, you can skip this.
  const { data } = await Tesseract.recognize(Buffer.from(buffer), 'eng', {});
  return data.text || '';
}
