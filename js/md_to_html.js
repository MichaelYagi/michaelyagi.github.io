function formatMessage(text) {
    // Unescape literal \n and \t sequences (e.g. from tool output)
    text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const blocks=[],inline=[],links=[],mathInline=[],mathBlock=[];
    text=text.replace(/\$\$([\s\S]*?)\$\$/g,(m,math)=>{const i=mathBlock.length;mathBlock.push(math);return`@@MATHBLOCK_${i}@@`;});
    text=text.replace(/\\\[([\s\S]*?)\\\]/g,(m,math)=>{const i=mathBlock.length;mathBlock.push(math);return`@@MATHBLOCK_${i}@@`;});
    text=text.replace(/\\\(([\s\S]*?)\\\)/g,(m,math)=>{const i=mathInline.length;mathInline.push(math);return`@@MATHINLINE_${i}@@`;});
    text=text.replace(/([ \t]*)```(\w+)?\s*\n?([\s\S]*?)```/g,(m,indent,lang,code)=>{
        const indentLen=indent.length,lines=code.split('\n');
        const dedented=lines.map(l=>l.trim().length===0?'':l.startsWith(indent)?l.slice(indentLen):l.trimStart()).join('\n').trim();
        const i=blocks.length;blocks.push({lang:lang||"code",code:dedented});return`@@CODEBLOCK_${i}@@`;
    });
    text=text.replace(/'''([\s\S]*?)'''/g,(m,code)=>{const i=blocks.length;blocks.push({lang:"code",code});return`@@CODEBLOCK_${i}@@`;});
    text=text.replace(/`([^`]+)`/g,(m,code)=>{const i=inline.length;inline.push(code);return`@@INLINE_${i}@@`;});
    const images=[];
    text=text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g,(m,alt,url)=>{const i=images.length;images.push({alt,url});return`@@IMAGE_${i}@@`;});
    text=text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,(m,label,url)=>{const i=links.length;links.push({label,url});return`@@LINK_${i}@@`;});
    text=text.replace(/(?<!\]\()(?<!")https?:\/\/[^\s<>"]+/g,(url)=>{
        // Strip trailing punctuation, but only strip ) if it's unbalanced
        // e.g. https://en.wikipedia.org/wiki/Foo_(bar) — keep the )
        //      "see https://example.com)" — strip the )
        let trailing = url.match(/[.,;:!?'"]+$/)?.[0] || '';
        let cleanUrl = url.slice(0, url.length - trailing.length);
        // Strip only unbalanced closing parens
        const openCount  = (cleanUrl.match(/\(/g) || []).length;
        const closeCount = (cleanUrl.match(/\)/g) || []).length;
        if (closeCount > openCount) {
            const extra = closeCount - openCount;
            const stripped = ')'.repeat(extra);
            cleanUrl = cleanUrl.slice(0, cleanUrl.length - extra);
            trailing = stripped + trailing;
        }
        // Strip trailing ] if unbalanced
        if (cleanUrl.endsWith(']') && !cleanUrl.includes('[')) {
            trailing = ']' + trailing;
            cleanUrl = cleanUrl.slice(0, -1);
        }
        const i=links.length;links.push({label:cleanUrl,url:cleanUrl});return`@@LINK_${i}@@${trailing}`;
    });
    text=text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    text=text.replace(/^######\s+(.+)$/gm,"<h6>$1</h6>").replace(/^#####\s+(.+)$/gm,"<h5>$1</h5>").replace(/^####\s+(.+)$/gm,"<h4>$1</h4>").replace(/^###\s+(.+)$/gm,"<h3>$1</h3>").replace(/^##\s+(.+)$/gm,"<h2>$1</h2>").replace(/^#\s+(.+)$/gm,"<h1>$1</h1>");
    text=text.replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/~~(.+?)~~/g,"<del>$1</del>");
    text=text.replace(/^>\s+(.+)$/gm,"<blockquote>$1</blockquote>").replace(/^([-*_]){3,}$/gm,"<hr>").replace(/^- /gm,"&bull; ").replace(/^\* /gm,"&bull; ");
    text=text.replace(/^(\|.+\|)\s*\n(\|[-:\s|]+\|)\s*\n((?:\|.*\|\s*\n?)*)/gm,(match,header,divider,rows)=>{
        const makeRow=row=>"<tr>"+row.trim().slice(1,-1).split("|").map(cell=>`<td>${cell.trim()}</td>`).join("")+"</tr>";
        return`<table><thead>${makeRow(header).replace(/<td>/g,"<th>").replace(/<\/td>/g,"</th>")}</thead><tbody>${rows.trim().split("\n").filter(r=>r.trim().startsWith("|")).map(makeRow).join("")}</tbody></table>`;
    });
    text=text.replace(/\n\s*\n/g,"<br><br>").replace(/\n/g,"<br>").replace(/(<\/h[1-6]>)(<br>){2}/g,"$1<br>");
    const processMath=(math)=>{
        math=math.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        math=math.replace(/\\text\{([^}]+)\}/g,'$1');
        const symbols={'\\pm':'±','\\times':'×','\\div':'÷','\\cdot':'·','\\neq':'≠','\\leq':'≤','\\geq':'≥','\\approx':'≈','\\infty':'∞','\\pi':'π','\\rightarrow':'→','\\forall':'∀','\\exists':'∃','\\degree':'°','\\phi':'Φ'};
        Object.entries(symbols).forEach(([t,s])=>{math=math.split(t).join(s);});
        math=math.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g,'<sup>$1</sup>√($2)').replace(/\\sqrt\{([^}]+)\}/g,'√($1)').replace(/\^\{([^}]+)\}/g,'<sup>$1</sup>').replace(/\^([a-zA-Z0-9+-]+)/g,'<sup>$1</sup>').replace(/_\{([^}]+)\}/g,'<sub>$1</sub>').replace(/_([a-zA-Z0-9+-]+)/g,'<sub>$1</sub>').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g,'($1)/($2)');
        return`<strong>${math}</strong>`;
    };
    text=text.replace(/@@INLINE_(\d+)@@/g,(m,i)=>`<code class="code-inline">${inline[i].replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code>`);
    text=text.replace(/@@CODEBLOCK_(\d+)@@/g,(m,i)=>{
        const block=blocks[i],escaped=block.code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),id=`cb_${Date.now()}_${i}`;
        return`<div style="position:relative;margin:8px 0;"><button class="copy-btn" data-target="${id}" style="position:absolute;top:6px;right:6px;background:rgba(255,255,255,0.1);border:none;border-radius:${document.documentElement.getAttribute('data-theme')==='matrix'?'0':'4px'};padding:4px 6px;cursor:pointer;color:#aaa;display:flex;align-items:center;z-index:1;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><pre><code id="${id}" class="language-${block.lang}">${escaped.trim()}</code></pre></div>`;
    });
    text=text.replace(/@@MATHINLINE_(\d+)@@/g,(m,i)=>processMath(mathInline[i]));
    text=text.replace(/@@MATHBLOCK_(\d+)@@/g,(m,i)=>processMath(mathBlock[i]));
    text=text.replace(/@@LINK_(\d+)@@/g,(m,i)=>`<a href="${links[i].url}" target="_blank">${links[i].label}</a>`);
    text=text.replace(/@@IMAGE_(\d+)@@/g,(m,i)=>{
        const src = images[i].url.replace(/\/thumbnails\/\d+\//,'/thumbnails/original/');
        const radius = document.documentElement.getAttribute('data-theme')==='matrix'?'0':'6px';
        return `<img src="${src}" alt="${images[i].alt}" style="max-width:100%;height:auto;border-radius:${radius};display:block;margin:4px 0;object-fit:contain;">`;
    });
    return text;
}