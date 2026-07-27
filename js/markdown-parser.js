// Simple Markdown Parser for Chronicles Blog
// Location: /home/hullivan/Hugues.W.B.dePingon/js/markdown-parser.js
// No external dependencies - pure JavaScript implementation

/**
 * Parse YAML front matter from markdown content
 * @param {string} content - Full markdown content
 * @returns {object} { metadata, markdown }
 */
export function parseFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (!match) {
        return { metadata: {}, markdown: content };
    }

    const yamlContent = match[1];
    const markdown = match[2];

    // Parse YAML (simple key: value format)
    const metadata = {};
    yamlContent.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Convert numbers
            if (!isNaN(value) && value !== '') {
                value = Number(value);
            }

            metadata[key] = value;
        }
    });

    return { metadata, markdown };
}

/**
 * Apply inline markdown formatting (bold, italic, code, links, images).
 * Code spans are extracted first so their contents are never re-parsed.
 * @param {string} text - A single logical line/segment of markdown
 * @returns {string} HTML with inline formatting applied
 */
function inlineFormat(text) {
    const codeSpans = [];

    // Extract inline code first so its contents are left untouched.
    text = text.replace(/`([^`]+)`/g, (_match, code) => {
        codeSpans.push(`<code>${escapeHTML(code)}</code>`);
        return `\u0000${codeSpans.length - 1}\u0000`;
    });

    // Images before links (they share bracket syntax).
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy" />');

    // Links.
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Bold, then italic.
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Restore code spans.
    text = text.replace(/\u0000(\d+)\u0000/g, (_m, idx) => codeSpans[Number(idx)]);

    return text;
}

/**
 * Convert markdown to HTML using a block-based parser.
 * Supports headings, paragraphs, blockquotes, horizontal rules,
 * ordered/unordered lists, fenced code blocks, and inline formatting.
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export function markdownToHTML(markdown) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;

    const isBlank = (line) => line.trim() === '';

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Blank lines separate blocks.
        if (isBlank(line)) {
            i++;
            continue;
        }

        // Fenced code blocks (```lang ... ```)
        const fence = trimmed.match(/^```(\w+)?\s*$/);
        if (fence) {
            const lang = fence[1] || 'plaintext';
            const code = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                code.push(lines[i]);
                i++;
            }
            i++; // skip closing fence
            out.push(`<pre><code class="language-${lang}">${escapeHTML(code.join('\n'))}</code></pre>`);
            continue;
        }

        // Horizontal rule (--- or *** or ___)
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            out.push('<hr>');
            i++;
            continue;
        }

        // Headings (# ... ######)
        const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
        if (heading) {
            const level = heading[1].length;
            out.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
            i++;
            continue;
        }

        // Blockquotes (consecutive > lines)
        if (/^>\s?/.test(trimmed)) {
            const quote = [];
            while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
                quote.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            out.push(`<blockquote>${inlineFormat(quote.join(' ')).replace(/\n/g, '<br>')}</blockquote>`);
            continue;
        }

        // Unordered lists (-, *, +)
        if (/^[-*+]\s+/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
                items.push(`<li>${inlineFormat(lines[i].trim().replace(/^[-*+]\s+/, ''))}</li>`);
                i++;
            }
            out.push(`<ul>${items.join('')}</ul>`);
            continue;
        }

        // Ordered lists (1. 2. ...)
        if (/^\d+\.\s+/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
                items.push(`<li>${inlineFormat(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
                i++;
            }
            out.push(`<ol>${items.join('')}</ol>`);
            continue;
        }

        // Paragraph: gather consecutive non-blank, non-special lines.
        const para = [];
        while (
            i < lines.length &&
            !isBlank(lines[i]) &&
            !/^(#{1,6})\s+/.test(lines[i].trim()) &&
            !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
            !/^>\s?/.test(lines[i].trim()) &&
            !/^[-*+]\s+/.test(lines[i].trim()) &&
            !/^\d+\.\s+/.test(lines[i].trim()) &&
            !lines[i].trim().startsWith('```')
        ) {
            para.push(lines[i].trim());
            i++;
        }
        if (para.length) {
            out.push(`<p>${inlineFormat(para.join(' '))}</p>`);
        }
    }

    return out.join('\n');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Filenames starting with "-" are kept on disk but hidden from the site
 * (e.g. "-rils-siwomiz.md" will not appear in Poetics / Noematics).
 * @param {string} filename
 * @returns {boolean}
 */
export function isHiddenMarkdownFilename(filename) {
    const base = String(filename || '').split(/[/\\]/).pop() || '';
    return base.startsWith('-');
}

/**
 * Load and parse a markdown file from a given directory.
 * @param {string} filename - Filename (e.g., 'my-post.md')
 * @param {string} [dir='blog-posts'] - Directory the file lives in (no trailing slash)
 * @returns {Promise<object>} { metadata, html }
 */
export async function loadMarkdownPost(filename, dir = 'blog-posts') {
    try {
        const response = await fetch(`${dir}/${filename}`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }

        const content = await response.text();
        const { metadata, markdown } = parseFrontMatter(content);
        const html = markdownToHTML(markdown);

        return { metadata, html };
    } catch (error) {
        console.error('Error loading markdown post:', error);
        throw error;
    }
}

/**
 * Load all blog posts from a manifest file
 * @returns {Promise<Array>} Array of post objects
 */
export async function loadAllPosts() {
    try {
        // Load the manifest file that lists all posts
        const response = await fetch('blog-posts/manifest.json');
        if (!response.ok) {
            throw new Error('Failed to load posts manifest');
        }

        const manifest = await response.json();

        // Load all posts in parallel
        const posts = await Promise.all(
            manifest.posts.map(async (filename) => {
                const { metadata, html } = await loadMarkdownPost(filename);
                return {
                    filename,
                    ...metadata,
                    content: html
                };
            })
        );

        return posts;
    } catch (error) {
        console.error('Error loading all posts:', error);
        return [];
    }
}

