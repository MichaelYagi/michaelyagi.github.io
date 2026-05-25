function formatMessage(text) {
    const blocks = [], inline = [], links = [], mathInline = [], mathBlock = [];

    // Extract delimited math FIRST — before any unescape or sanitization,
    // so \t inside math delimiters is preserved and handled by processMath.
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (m, math) => { const i = mathBlock.length; mathBlock.push(math); return `@@MATHBLOCK_${i}@@`; });
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (m, math) => { const i = mathBlock.length; mathBlock.push(math); return `@@MATHBLOCK_${i}@@`; });
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (m, math) => { const i = mathInline.length; mathInline.push(math); return `@@MATHINLINE_${i}@@`; });

    // Extract code blocks before unescape so \t inside code is not mangled.
    text = text.replace(/([ \t]*)```(\w+)?\s*\n?([\s\S]*?)```/g, (m, indent, lang, code) => {
        const indentLen = indent.length, lines = code.split('\n');
        const dedented = lines.map(l => l.trim().length === 0 ? '' : l.startsWith(indent) ? l.slice(indentLen) : l.trimStart()).join('\n').trim();
        const i = blocks.length; blocks.push({ lang: lang || "code", code: dedented }); return `@@CODEBLOCK_${i}@@`;
    });
    text = text.replace(/'''([\s\S]*?)'''/g, (m, code) => { const i = blocks.length; blocks.push({ lang: "code", code }); return `@@CODEBLOCK_${i}@@`; });

    // Extract inline code before sanitizer so \times inside backticks is protected.
    text = text.replace(/`([^`]+)`/g, (m, code) => { const i = inline.length; inline.push(code); return `@@INLINE_${i}@@`; });

    // Unescape literal \n and \t sequences from tool output (prose only — placeholders are safe).
    text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    // -- Bare LaTeX sanitizer --------------------------------------------
    // At this point: math/code/inline placeholders are extracted.
    // Models emit LaTeX two ways:
    //   a) Proper backslash: \times (backslash = \x5c)
    //   b) Tab-corrupted:   tab+imes  (because \t was consumed as tab)
    // The char class [\x5c\t] matches either prefix in one pass.
    // Multi-char patterns (\frac, \sqrt, \text) before single symbols.
    text = text.replace(/[\x5c\t]ext\s*\{([^}]*)\}/g, '$1');
    text = text.replace(/[\x5c\t]frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '($1)/($2)');
    text = text.replace(/[\x5c\t]sqrt\s*\[([^\]]+)\]\s*\{([^}]+)\}/g, '<sup>$1</sup>\u221a($2)');
    text = text.replace(/[\x5c\t]sqrt\s*\{([^}]*)\}/g, '\u221a($1)');
    text = text.replace(/[\x5c\t]left\s*\(/g, '(').replace(/[\x5c\t]right\s*\)/g, ')');
    text = text.replace(/[\x5c\t]left\s*\[/g, '[').replace(/[\x5c\t]right\s*\]/g, ']');
    text = text.replace(/[\x5c\t]left\s*\{/g, '{').replace(/[\x5c\t]right\s*\}/g, '}');
    text = text.replace(/\^\{([^}]+)\}/g, '^$1');
    text = text.replace(/_\{([^}]+)\}/g, '_$1');
    text = text.replace(/[\x5c\t]imes(?![a-zA-Z])/g,    '\u00d7');
    text = text.replace(/[\x5c\t]cdot(?![a-zA-Z])/g,    '\u00b7');
    text = text.replace(/[\x5c\t]div(?![a-zA-Z])/g,     '\u00f7');
    text = text.replace(/[\x5c\t]pm(?![a-zA-Z])/g,      '\u00b1');
    text = text.replace(/[\x5c\t]approx(?![a-zA-Z])/g,  '\u2248');
    text = text.replace(/[\x5c\t]neq(?![a-zA-Z])/g,     '\u2260');
    text = text.replace(/[\x5c\t]leq(?![a-zA-Z])/g,     '\u2264');
    text = text.replace(/[\x5c\t]geq(?![a-zA-Z])/g,     '\u2265');
    text = text.replace(/[\x5c\t]infty(?![a-zA-Z])/g,   '\u221e');
    text = text.replace(/[\x5c\t]pi(?![a-zA-Z])/g,      '\u03c0');
    text = text.replace(/[\x5c\t]omega(?![a-zA-Z])/g,   '\u03c9');
    text = text.replace(/[\x5c\t]alpha(?![a-zA-Z])/g,   '\u03b1');
    text = text.replace(/[\x5c\t]beta(?![a-zA-Z])/g,    '\u03b2');
    text = text.replace(/[\x5c\t]gamma(?![a-zA-Z])/g,   '\u03b3');
    text = text.replace(/[\x5c\t]heta(?![a-zA-Z])/g,    '\u03b8');
    text = text.replace(/[\x5c\t]sigma(?![a-zA-Z])/g,   '\u03c3');
    text = text.replace(/[\x5c\t]lambda(?![a-zA-Z])/g,  '\u03bb');
    text = text.replace(/[\x5c\t]mu(?![a-zA-Z])/g,      '\u03bc');
    text = text.replace(/[\x5c\t]Delta(?![a-zA-Z])/g,   '\u0394');
    text = text.replace(/[\x5c\t]Sigma(?![a-zA-Z])/g,   '\u03a3');
    text = text.replace(/[\x5c\t]Omega(?![a-zA-Z])/g,   '\u03a9');
    text = text.replace(/[\x5c\t]phi(?![a-zA-Z])/g,     '\u03c6');
    text = text.replace(/[\x5c\t]Phi(?![a-zA-Z])/g,     '\u03a6');
    text = text.replace(/[\x5c\t]psi(?![a-zA-Z])/g,     '\u03c8');
    text = text.replace(/[\x5c\t]rightarrow(?![a-zA-Z])/g, '\u2192');
    text = text.replace(/[\x5c\t]leftarrow(?![a-zA-Z])/g,  '\u2190');
    text = text.replace(/[\x5c\t]Rightarrow(?![a-zA-Z])/g, '\u21d2');
    text = text.replace(/[\x5c\t]Leftarrow(?![a-zA-Z])/g,  '\u21d0');
    text = text.replace(/[\x5c\t]forall(?![a-zA-Z])/g,  '\u2200');
    text = text.replace(/[\x5c\t]exists(?![a-zA-Z])/g,  '\u2203');
    text = text.replace(/[\x5c\t]degree(?![a-zA-Z])/g,  '\u00b0');
    text = text.replace(/[\x5c\t]circ(?![a-zA-Z])/g,    '\u00b0');
    // --------------------------------------------------------------------

    const images = [];
    text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g, (m, alt, url) => { const i = images.length; images.push({ alt, url }); return `@@IMAGE_${i}@@`; });
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (m, label, url) => { const i = links.length; links.push({ label, url }); return `@@LINK_${i}@@`; });
    text = text.replace(/(?<!\]\()(?<!")https?:\/\/[^\s<>"]+/g, (url) => {
        let trailing = url.match(/[.,;:!?'"]+$/)?.[0] || '';
        let cleanUrl = url.slice(0, url.length - trailing.length);
        const openCount  = (cleanUrl.match(/\(/g) || []).length;
        const closeCount = (cleanUrl.match(/\)/g) || []).length;
        if (closeCount > openCount) {
            const extra = closeCount - openCount;
            cleanUrl = cleanUrl.slice(0, cleanUrl.length - extra);
            trailing = ')'.repeat(extra) + trailing;
        }
        if (cleanUrl.endsWith(']') && !cleanUrl.includes('[')) {
            trailing = ']' + trailing;
            cleanUrl = cleanUrl.slice(0, -1);
        }
        const i = links.length; links.push({ label: cleanUrl, url: cleanUrl }); return `@@LINK_${i}@@${trailing}`;
    });
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>").replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>").replace(/^####\s+(.+)$/gm, "<h4>$1</h4>").replace(/^###\s+(.+)$/gm, "<h3>$1</h3>").replace(/^##\s+(.+)$/gm, "<h2>$1</h2>").replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/~~(.+?)~~/g, "<del>$1</del>");
    text = text.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>").replace(/^([-*_]){3,}$/gm, "<hr>").replace(/^- /gm, "&bull; ").replace(/^\* /gm, "&bull; ");
    text = text.replace(/^(\|.+\|)\s*\n(\|[-:\s|]+\|)\s*\n((?:\|.*\|\s*\n?)*)/gm, (match, header, divider, rows) => {
        const makeRow = row => "<tr>" + row.trim().slice(1, -1).split("|").map(cell => `<td>${cell.trim()}</td>`).join("") + "</tr>";
        return `<table><thead>${makeRow(header).replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>")}</thead><tbody>${rows.trim().split("\n").filter(r => r.trim().startsWith("|")).map(makeRow).join("")}</tbody></table>`;
    });
    text = text.replace(/\n\s*\n/g, "<br><br>").replace(/\n/g, "<br>").replace(/(<\/h[1-6]>)(<br>){2}/g, "$1<br>");
    const processMath = (math) => {
        math = math.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // processMath receives content that may have tab-corrupted keywords
        // (because it was extracted before the \t unescape). Handle both forms.
        math = math.replace(/[\x5c\t]ext\s*\{([^}]*)\}/g, '$1');
        const symbols = { '\u005cpm': '\u00b1', '\u005ctimes': '\u00d7', '\u005cdiv': '\u00f7', '\u005ccdot': '\u00b7', '\u005cneq': '\u2260', '\u005cleq': '\u2264', '\u005cgeq': '\u2265', '\u005capprox': '\u2248', '\u005cinfty': '\u221e', '\u005cpi': '\u03c0', '\u005crightarrow': '\u2192', '\u005cforall': '\u2200', '\u005cexists': '\u2203', '\u005cdegree': '\u00b0', '\u005cphi': '\u03a6' };
        // Also handle tab-corrupted forms in math
        const tabSymbols = { '\times': '\u00d7', '\div': '\u00f7', '\cdot': '\u00b7', '\pm': '\u00b1', '\neq': '\u2260', '\leq': '\u2264', '\geq': '\u2265', '\approx': '\u2248', '\infty': '\u221e', '\pi': '\u03c0' };
        Object.entries(symbols).forEach(([t, s]) => { math = math.split(t).join(s); });
        Object.entries(tabSymbols).forEach(([t, s]) => { math = math.split(t).join(s); });
        math = math.replace(/[\x5c\t]sqrt\[([^\]]+)\]\{([^}]+)\}/g, '<sup>$1</sup>\u221a($2)').replace(/[\x5c\t]sqrt\{([^}]+)\}/g, '\u221a($1)').replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/\^([a-zA-Z0-9+-]+)/g, '<sup>$1</sup>').replace(/_\{([^}]+)\}/g, '<sub>$1</sub>').replace(/_([a-zA-Z0-9+-]+)/g, '<sub>$1</sub>').replace(/[\x5c\t]frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
        return `<strong>${math}</strong>`;
    };
    text = text.replace(/@@INLINE_(\d+)@@/g, (m, i) => `<code class="code-inline">${inline[i].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
    text = text.replace(/@@CODEBLOCK_(\d+)@@/g, (m, i) => {
        const block = blocks[i], escaped = block.code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), id = `cb_${Date.now()}_${i}`;
        return `<div style="position:relative;margin:8px 0;"><button class="copy-btn" data-target="${id}" style="position:absolute;top:6px;right:6px;background:rgba(255,255,255,0.1);border:none;border-radius:${document.documentElement.getAttribute('data-theme') === 'matrix' ? '0' : '4px'};padding:4px 6px;cursor:pointer;color:#aaa;display:flex;align-items:center;z-index:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><pre><code id="${id}" class="language-${block.lang}">${escaped.trim()}</code></pre></div>`;
    });
    text = text.replace(/@@MATHINLINE_(\d+)@@/g, (m, i) => processMath(mathInline[i]));
    text = text.replace(/@@MATHBLOCK_(\d+)@@/g, (m, i) => processMath(mathBlock[i]));
    text = text.replace(/@@LINK_(\d+)@@/g, (m, i) => `<a href="${links[i].url}" target="_blank">${links[i].label}</a>`);
    text = text.replace(/@@IMAGE_(\d+)@@/g, (m, i) => {
        const src = images[i].url.replace(/\/thumbnails\/\d+\//, '/thumbnails/original/');
        const radius = document.documentElement.getAttribute('data-theme') === 'matrix' ? '0' : '6px';
        return `<img src="${src}" alt="${images[i].alt}" style="max-width:100%;height:auto;border-radius:${radius};display:block;margin:4px 0;object-fit:contain;">`;
    });
    return text;
}
