type PageOptions = {
  lang: string;
  title: string;
  headTags: string[];
  body: string;
  scripts: string[];
};

export function renderHtmlPage({ lang, title, headTags, body, scripts }: PageOptions): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${headTags.join('\n')}
</head>
<body>
${body}
${scripts.join('\n')}
</body>
</html>`;
}
