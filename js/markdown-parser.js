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
 * Convert markdown to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export function markdownToHTML(markdown) {
    let html = markdown;

    // Escape HTML to prevent XSS (but preserve intentional HTML)
    // This is a simple implementation - be careful with user input

    // Headers (h1-h6)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code blocks (```language ... ```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${escapeHTML(code.trim())}</code></pre>`;
    });

    // Inline code (`code`)
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Links ([text](url))
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images (![alt](url))
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />');

    // Unordered lists (- item or * item)
    html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ol> if not already in <ul>
    html = html.replace(/(<li>(?:(?!<ul>).)*<\/li>)/gs, (match) => {
        if (!match.includes('<ul>')) {
            return `<ol>${match}</ol>`;
        }
        return match;
    });

    // Blockquotes (> text)
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule (--- or ***)
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Paragraphs (wrap non-HTML lines)
    const lines = html.split('\n');
    let inList = false;
    let inCodeBlock = false;

    html = lines.map(line => {
        const trimmedLine = line.trim();

        // Track code blocks
        if (trimmedLine.startsWith('<pre>')) inCodeBlock = true;
        if (trimmedLine.endsWith('</pre>')) {
            inCodeBlock = false;
            return line;
        }
        if (inCodeBlock) return line;

        // Track lists
        if (trimmedLine.startsWith('<ul>') || trimmedLine.startsWith('<ol>')) inList = true;
        if (trimmedLine.startsWith('</ul>') || trimmedLine.startsWith('</ol>')) {
            inList = false;
            return line;
        }
        if (inList) return line;

        // Don't wrap already-HTML lines or empty lines
        if (trimmedLine === '' ||
            trimmedLine.startsWith('<') ||
            trimmedLine.endsWith('>')) {
            return line;
        }

        // Wrap in paragraph
        return `<p>${line}</p>`;
    }).join('\n');

    // Clean up extra newlines and spaces
    html = html.replace(/\n{3,}/g, '\n\n');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/<\/ol>\s*<ol>/g, '');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');

    return html;
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
 * Load and parse a markdown file from blog-posts directory
 * @param {string} filename - Filename (e.g., 'my-post.md')
 * @returns {Promise<object>} { metadata, html }
 */
export async function loadMarkdownPost(filename) {
    try {
        const response = await fetch(`blog-posts/${filename}`);
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

