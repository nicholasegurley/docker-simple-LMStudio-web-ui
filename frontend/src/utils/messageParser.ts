export interface ParsedFile {
  name: string;
  content: string;
}

export interface ParsedMessage {
  text: string;
  files: ParsedFile[];
}

/**
 * Parse a message to extract file content and regular text
 * Files are marked with [File: filename]...content...[/File: filename]
 */
export function parseMessage(content: string): ParsedMessage {
  const fileRegex = /\[File:\s*([^\]]+)\]\s*([\s\S]*?)\s*\[\/File:\s*\1\]/g;
  const files: ParsedFile[] = [];
  let text = content;
  let match;

  // Extract all files
  while ((match = fileRegex.exec(content)) !== null) {
    const fileName = match[1].trim();
    const fileContent = match[2].trim();
    files.push({ name: fileName, content: fileContent });
    // Remove the file section from text
    text = text.replace(match[0], '');
  }

  // Clean up extra whitespace
  text = text.trim();

  return { text, files };
}

