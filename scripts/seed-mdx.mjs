/**
 * Seed script: Imports all MDX content files into the Post table.
 * Run with: node scripts/seed-mdx.mjs
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
const prisma = new PrismaClient();

function parseFrontmatter(fileContent) {
  // Remove leading comment lines (e.g. // FILE: ...)
  const cleaned = fileContent.replace(/^\/\/.*\n/gm, "");
  const match = cleaned.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: cleaned.trim() };
  const frontmatter = {};
  match[1].split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Handle arrays like ['a', 'b']
    if (val.startsWith("[") && val.endsWith("]")) {
      try {
        frontmatter[key] = JSON.parse(val.replace(/'/g, '"'));
      } catch {
        frontmatter[key] = [];
      }
    } else {
      // Remove wrapping quotes
      val = val.replace(/^['"]|['"]$/g, "");
      frontmatter[key] = val;
    }
  });
  return { data: frontmatter, content: match[2].trim() };
}

const MDX_MAP = [
  {
    dir: "research",
    type: "RESEARCH",
    mapFn: (data, slug, content) => ({
      slug,
      title: data.title || slug,
      excerpt: data.summary || null,
      content,
      type: "RESEARCH",
      published: true,
      tags: Array.isArray(data.tags) ? data.tags : [],
      publishedAt: data.date ? new Date(data.date) : new Date(),
    }),
  },
  {
    dir: "insights",
    type: "INSIGHT",
    mapFn: (data, slug, content) => ({
      slug,
      title: data.title || slug,
      excerpt: data.thesis || null,
      content,
      type: "INSIGHT",
      published: true,
      tags: [],
      publishedAt: data.date ? new Date(data.date) : new Date(),
    }),
  },
  {
    dir: "case-studies",
    type: "CASE_STUDY",
    mapFn: (data, slug, content) => ({
      slug,
      title: data.title || slug,
      excerpt: data.outcome || null,
      content,
      type: "CASE_STUDY",
      published: true,
      tags: [],
      publishedAt: data.date ? new Date(data.date) : new Date(),
    }),
  },
  {
    dir: "podcast",
    type: "RESEARCH",
    mapFn: (data, slug, content) => ({
      slug,
      title: data.title || slug,
      excerpt: data.description || null,
      content,
      type: "OTHER",
      published: true,
      tags: [],
      publishedAt: data.date ? new Date(data.date) : new Date(),
    }),
  },
  {
    dir: "data-lab",
    type: "RESEARCH",
    mapFn: (data, slug, content) => ({
      slug,
      title: data.title || slug,
      excerpt: data.businessQuestion || null,
      content,
      type: "RESEARCH",
      published: true,
      tags: Array.isArray(data.tools) ? data.tools : [],
      publishedAt: data.date ? new Date(data.date) : new Date(),
    }),
  },
];

async function main() {
  console.log("🌱 Seeding MDX content into database...\n");

  // Find the admin user to use as author
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    console.warn("⚠️  No ADMIN user found. Looking for any user...");
    adminUser = await prisma.user.findFirst();
  }

  if (!adminUser) {
    console.error("❌ No users in database. Please create a user first.");
    process.exit(1);
  }

  console.log(`✅ Using author: ${adminUser.email} (${adminUser.role})\n`);

  let seeded = 0;
  let skipped = 0;

  for (const { dir, mapFn } of MDX_MAP) {
    const dirPath = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(".mdx", "");
      const fileContent = fs.readFileSync(path.join(dirPath, file), "utf8");
      const { data, content } = parseFrontmatter(fileContent);
      const postData = mapFn(data, slug, content);

      try {
        const existing = await prisma.post.findUnique({ where: { slug } });
        if (existing) {
          console.log(`⏭️  Skipping (already exists): ${slug}`);
          skipped++;
          continue;
        }

        await prisma.post.create({
          data: {
            ...postData,
            authorId: adminUser.id,
          },
        });

        console.log(`✅ Imported [${postData.type}]: ${postData.title}`);
        seeded++;
      } catch (err) {
        console.error(`❌ Failed to import ${slug}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Done! Seeded: ${seeded}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
