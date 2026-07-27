/**
 * Extract bilingual TDT lore into Hugues site /poetics/*.md
 * Sources: universe book FR HTML + EN JSON, race locales, peoples invectives.
 */
import fs from 'fs';
import path from 'path';

const TDT = 'D:/Toys/WEBSITE/TDT-website/test';
const OUT = 'D:/Toys/WEBSITE/Hugues.W.B.dePingon/poetics';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stripTags(html) {
  return String(html || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function yamlQuote(value) {
  const s = String(value ?? '').replace(/\s+/g, ' ').trim();
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function estimateReadTime(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function writePost({ filename, title, titleFr, category, excerpt, excerptFr, question, questionFr, bodyEn, bodyFr, date = '2024-01-01', tags = '' }) {
  const readTime = estimateReadTime(`${bodyEn}\n${bodyFr}`);
  const md = `---
title: ${yamlQuote(title)}
title_fr: ${yamlQuote(titleFr)}
category: ${yamlQuote(category)}
date: "${date}"
readTime: ${readTime}
question: ${yamlQuote(question || '')}
question_fr: ${yamlQuote(questionFr || '')}
tags: ${yamlQuote(tags)}
excerpt: ${yamlQuote(excerpt)}
excerpt_fr: ${yamlQuote(excerptFr)}
---

<!--lang:en-->

# ${title}

${bodyEn.trim()}

<!--lang:fr-->

# ${titleFr}

${bodyFr.trim()}
`;
  fs.writeFileSync(path.join(OUT, filename), md, 'utf8');
  return filename;
}

function extractUniverse() {
  const frHtml = fs.readFileSync(path.join(TDT, 'partials/universe-lore-fr.html'), 'utf8');
  const posts = [];

  // Intro (data-en / data-fr blocks)
  const introPartsEn = [];
  const introPartsFr = [];
  const introBlock = frHtml.match(/<div class="universe-lore-intro">([\s\S]*?)<\/div>\s*<details/);
  if (introBlock) {
    const block = introBlock[1];
    const attrRe = /data-en="([^"]*)"[^>]*data-fr="([^"]*)"|data-fr="([^"]*)"[^>]*data-en="([^"]*)"/g;
    let m;
    while ((m = attrRe.exec(block))) {
      const en = (m[1] ?? m[4] ?? '').replace(/&quot;/g, '"');
      const fr = (m[2] ?? m[3] ?? '').replace(/&quot;/g, '"');
      if (en) introPartsEn.push(en);
      if (fr) introPartsFr.push(fr);
    }
  }
  if (introPartsEn.length) {
    posts.push(writePost({
      filename: 'universe-lore-intro.md',
      title: 'Setting archaeology',
      titleFr: 'Archéologie du décor',
      category: 'universe-book',
      tags: 'Universe, Setting',
      excerpt: introPartsEn[0].slice(0, 180) + '…',
      excerptFr: introPartsFr[0].slice(0, 180) + '…',
      question: 'What pasts mark every region of the Discording Tales?',
      questionFr: 'Quels passés marquent chaque région des Récits Discordants ?',
      bodyEn: introPartsEn.map((p, i) => (i === 0 || i === introPartsEn.length - 1 ? p : `- ${p}`)).join('\n\n'),
      bodyFr: introPartsFr.map((p, i) => (i === 0 || i === introPartsFr.length - 1 ? p : `- ${p}`)).join('\n\n'),
      date: '2024-06-01'
    }));
  }

  const entryRe = /<details class="universe-lore-entry" data-lore-id="([^"]+)">\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="universe-lore-entry__body">([\s\S]*?)<\/div>\s*<\/details>/g;
  let match;
  while ((match = entryRe.exec(frHtml))) {
    const id = match[1];
    const summaryFr = stripTags(match[2]);
    const bodyFrHtml = match[3];
    const enPath = path.join(TDT, 'public/data/universe-lore-en', `${id}.json`);
    if (!fs.existsSync(enPath)) {
      console.warn('Missing EN for', id);
      continue;
    }
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const bodyEn = stripTags(en.bodyHtml).replace(/^Page\s+\d+\s*\n+/i, '');
    const bodyFr = stripTags(bodyFrHtml).replace(/^Page\s+\d+\s*\n+/i, '');
    const firstEn = bodyEn.split(/\n\n/).find((p) => p && !/^Page\s+\d+/i.test(p)) || bodyEn;
    const firstFr = bodyFr.split(/\n\n/).find((p) => p && !/^Page\s+\d+/i.test(p)) || bodyFr;
    posts.push(writePost({
      filename: `${id}.md`,
      title: en.summary || id,
      titleFr: summaryFr,
      category: 'universe-book',
      tags: 'Universe, Book fragment',
      excerpt: firstEn.slice(0, 180) + (firstEn.length > 180 ? '…' : ''),
      excerptFr: firstFr.slice(0, 180) + (firstFr.length > 180 ? '…' : ''),
      question: en.summary,
      questionFr: summaryFr,
      bodyEn,
      bodyFr,
      date: '2024-06-01'
    }));
  }
  return posts;
}

function extractRaces() {
  const en = JSON.parse(fs.readFileSync(path.join(TDT, 'locales/en.json'), 'utf8'));
  const fr = JSON.parse(fs.readFileSync(path.join(TDT, 'locales/fr.json'), 'utf8'));
  const skip = new Set(['physique', 'traits', 'traditions', 'label']);
  const keys = Object.keys(en).filter((k) => {
    if (!k.startsWith('races.')) return false;
    const rest = k.slice(6);
    if (rest.includes('.')) return false;
    if (skip.has(rest) || rest.startsWith('label')) return false;
    return true;
  });

  // Prefer first clause / named race from opening sentence for titles
  function raceTitle(slug, text) {
    const m = text.match(/^(.{10,110}?)(?:\.|\n)/);
    if (m) {
      const bit = m[1];
      const nameMatch = bit.match(/\b([A-ZÀ-Ü][\w'’\-]*(?:\s[\w'’\-]+){0,4}\s*\([^)]+\))/);
      if (nameMatch) return nameMatch[1].trim();
      return bit.trim();
    }
    return slug.replace(/_/g, ' ');
  }

  const posts = [];
  for (const key of keys) {
    const slug = key.slice(6);
    const enText = en[key];
    const frText = fr[key];
    if (!enText || !frText) continue;
    const titleEn = raceTitle(slug, enText);
    const titleFr = raceTitle(slug, frText);
    const bodyEn = enText.replace(/\n\n• /g, '\n\n- ').replace(/\n• /g, '\n- ');
    const bodyFr = frText.replace(/\n\n• /g, '\n\n- ').replace(/\n• /g, '\n- ');
    posts.push(writePost({
      filename: `race-${slug.replace(/_/g, '-')}.md`,
      title: titleEn,
      titleFr,
      category: 'races',
      tags: 'Peoples, Races',
      excerpt: bodyEn.split('\n\n')[0].slice(0, 180) + '…',
      excerptFr: bodyFr.split('\n\n')[0].slice(0, 180) + '…',
      question: `Who are the ${titleEn}?`,
      questionFr: `Qui sont les ${titleFr} ?`,
      bodyEn,
      bodyFr,
      date: '2024-06-15'
    }));
  }
  return posts;
}

function extractInvectives() {
  const src = fs.readFileSync(path.join(TDT, 'public/js/peoples-invective-slides.js'), 'utf8');
  // Evaluate the IIFE-ish array by extracting JSON-like objects carefully
  const arrayMatch = src.match(/w\.TDT_PEOPLES_INVECTIVE_SLIDES\s*=\s*(\[[\s\S]*?\]);/);
  if (!arrayMatch) {
    console.warn('Could not parse invectives');
    return [];
  }
  // Convert JS object literals to JSON-ish via Function
  let slides;
  try {
    slides = Function(`"use strict"; return (${arrayMatch[1]});`)();
  } catch (err) {
    console.warn('Invective eval failed', err);
    return [];
  }

  const slugFrom = (titleEn) => {
    const plain = stripTags(titleEn).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return plain.split('-')[0] || 'people';
  };

  return slides.map((slide) => {
    const titleEn = stripTags(slide.titleEn);
    const titleFr = stripTags(slide.titleFr);
    const slug = slugFrom(titleEn);
    return writePost({
      filename: `invective-${slug}.md`,
      title: titleEn,
      titleFr,
      category: 'invectives',
      tags: 'Peoples, Invective, Satire',
      excerpt: slide.bodyEn.slice(0, 180) + '…',
      excerptFr: slide.bodyFr.slice(0, 180) + '…',
      question: `How do rivals speak of the ${titleEn}?`,
      questionFr: `Comment parle-t-on des ${titleFr} ?`,
      bodyEn: slide.bodyEn,
      bodyFr: slide.bodyFr,
      date: '2024-06-20'
    });
  });
}

function extractCosmologyBundles() {
  const en = JSON.parse(fs.readFileSync(path.join(TDT, 'locales/en.json'), 'utf8'));
  const fr = JSON.parse(fs.readFileSync(path.join(TDT, 'locales/fr.json'), 'utf8'));

  const bundles = [
    {
      filename: 'cosmology-fundamentals.md',
      title: 'Cytocosmism and continuity',
      titleFr: 'Cytocosmisme et continuité',
      keys: [15, 16, 17, 18, 19, 20, 21, 22],
      category: 'cosmology',
      question: 'What is the fabric of this cosmos?',
      questionFr: 'Quelle est la trame de ce cosmos ?'
    },
    {
      filename: 'cosmology-o-wom-hism.md',
      title: 'Ô, WÔM and HISM',
      titleFr: 'Ô, WÔM et HISM',
      keys: [23, 24, 25, 26, 27, 28, 29],
      category: 'cosmology',
      question: 'What are Ô, WÔM and HISM?',
      questionFr: 'Que sont Ô, WÔM et HISM ?'
    },
    {
      filename: 'cosmology-tetrarchs.md',
      title: 'The four tetrarchs',
      titleFr: 'Les quatre tétrarques',
      keys: Array.from({ length: 25 }, (_, i) => 30 + i),
      category: 'cosmology',
      question: 'Who are iôHôi, sôIôs, môSôm and hôMôh?',
      questionFr: 'Qui sont iôHôi, sôIôs, môSôm et hôMôh ?'
    },
    {
      filename: 'world-context-iaodunei.md',
      title: 'Iäoduneï and the world context',
      titleFr: 'Iäoduneï et le contexte du monde',
      keys: Array.from({ length: 14 }, (_, i) => 83 + i),
      category: 'world-context',
      question: 'What shapes the known world of Iäoduneï?',
      questionFr: 'Qu\'est-ce qui façonne le monde connu d\'Iäoduneï ?'
    }
  ];

  const posts = [];
  for (const b of bundles) {
    const partsEn = [];
    const partsFr = [];
    for (const n of b.keys) {
      const k = `tpl.${n}`;
      if (en[k]) partsEn.push(en[k]);
      if (fr[k]) partsFr.push(fr[k]);
    }
    if (!partsEn.length || !partsFr.length) continue;
    const bodyEn = partsEn.join('\n\n');
    const bodyFr = partsFr.join('\n\n');
    posts.push(writePost({
      filename: b.filename,
      title: b.title,
      titleFr: b.titleFr,
      category: b.category,
      tags: 'Cosmology, Setting',
      excerpt: partsEn[0].slice(0, 180) + '…',
      excerptFr: partsFr[0].slice(0, 180) + '…',
      question: b.question,
      questionFr: b.questionFr,
      bodyEn,
      bodyFr,
      date: '2024-07-01'
    }));
  }
  return posts;
}

ensureDir(OUT);
// Clear previous generated md except we rewrite all
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.md') || f === 'manifest.json') fs.unlinkSync(path.join(OUT, f));
}

// Universe tab → Lore panel only (book fragments + panel intro).
const posts = [...extractUniverse()];

const manifest = {
  _comment: 'Poetics content index - Universe Lore tab book fragments only (bilingual). Each .md has <!--lang:en--> / <!--lang:fr--> bodies. Order in posts is carousel order.',
  posts
};

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote ${posts.length} poetics posts to ${OUT}`);
