import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs
// Use CDN for worker, fallback to version-specific URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface FileContent {
  name: string;
  type: string;
  content: string;
}

/**
 * Read text file content
 */
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = (e) => {
      reject(new Error('Failed to read text file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Read PDF file content
 */
export async function readPDFFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    throw new Error('Failed to read PDF file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const supportedTypes = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/pdf',
    'text/html',
    'application/json',
    'text/javascript',
    'text/css',
    'text/xml',
  ];
  
  // Check MIME type
  if (supportedTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension as fallback
  const extension = file.name.split('.').pop()?.toLowerCase();
  const supportedExtensions = ['txt', 'md', 'csv', 'pdf', 'html', 'json', 'js', 'css', 'xml', 'py', 'jsx', 'tsx', 'ts', 'java', 'cpp', 'c', 'h', 'hpp', 'go', 'rs', 'rb', 'php', 'sh', 'yaml', 'yml'];
  
  return supportedExtensions.includes(extension || '');
}

/**
 * Read file content based on file type
 */
export async function readFile(file: File): Promise<FileContent> {
  if (!isSupportedFileType(file)) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
  }
  
  let content: string;
  
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    content = await readPDFFile(file);
  } else {
    content = await readTextFile(file);
  }
  
  return {
    name: file.name,
    type: file.type || 'text/plain',
    content: content,
  };
}

