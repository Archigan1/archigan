import { readFileSync } from 'fs';

// --------------------------------------------------
// Main
// --------------------------------------------------

export default function renderTemplate(options: Options) {
  let template = readFileSync(options.path, 'utf8');

  Object.entries(options.data).forEach(([key, value]) => {
    template = template.replace(`<${key.toUpperCase()} />`, value);
  });

  return template;
}

// --------------------------------------------------
// Custom Types
// --------------------------------------------------

interface Options {
  path: string;
  data: {
    [element: string]: string;
  };
}