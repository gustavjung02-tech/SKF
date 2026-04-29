/**
 * Script: Xuất danh sách prompt để sinh ảnh card homepage.
 *
 * Chạy: npx tsx scripts/generate-card-images.ts
 *
 * Khi chưa có API image generation, script này xuất JSON danh sách prompt
 * để dùng thủ công hoặc qua workflow khác (Midjourney, DALL-E, Stable Diffusion…).
 *
 * Khi có API, bỏ comment phần fetch bên dưới và cấu hình API key.
 */

import { getAllImagePrompts } from "../src/data/home-card-images";
import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = path.resolve(__dirname, "../public/images/cards");
const PROMPTS_OUTPUT = path.resolve(__dirname, "../card-image-prompts.json");

function ensureTargetDirectories(prompts: ReturnType<typeof getAllImagePrompts>) {
  for (const item of prompts) {
    const fullPath = path.resolve(__dirname, "..", "public", item.targetPath.replace(/^\//, ""));
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  }
}

async function main() {
  const prompts = getAllImagePrompts();
  ensureTargetDirectories(prompts);

  // Đảm bảo thư mục output tồn tại
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // ─── Xuất danh sách prompt ra JSON ───────────────────────────────────────
  fs.writeFileSync(PROMPTS_OUTPUT, JSON.stringify(prompts, null, 2), "utf-8");
  console.log(`✔ Đã xuất ${prompts.length} prompt ra: ${PROMPTS_OUTPUT}\n`);

  // ─── In ra console để copy paste nhanh ───────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  DANH SÁCH PROMPT SINH ẢNH CARD HOMEPAGE");
  console.log("═══════════════════════════════════════════════════════════\n");

  for (const item of prompts) {
    console.log(`[${item.slug}]`);
    console.log(`  Target: ${item.targetPath}`);
    console.log(`  Prompt: ${item.prompt}`);
    console.log();
  }

  // ─── Kiểm tra ảnh nào còn thiếu ─────────────────────────────────────────
  const missing: string[] = [];
  const existing: string[] = [];

  for (const item of prompts) {
    const fullPath = path.resolve(__dirname, "..", "public", item.targetPath.replace(/^\//, ""));
    if (fs.existsSync(fullPath)) {
      existing.push(item.slug);
    } else {
      missing.push(item.slug);
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  TRẠNG THÁI ẢNH");
  console.log("═══════════════════════════════════════════════════════════\n");

  if (existing.length > 0) {
    console.log(`✔ Đã có ảnh (${existing.length}): ${existing.join(", ")}`);
  }
  if (missing.length > 0) {
    console.log(`✘ Cần tạo ảnh (${missing.length}): ${missing.join(", ")}`);
  }

  // ─── Placeholder: gọi AI image generation API ───────────────────────────
  // Bỏ comment và cấu hình khi có API key:
  //
  // const API_KEY = process.env.IMAGE_GEN_API_KEY;
  // if (!API_KEY) {
  //   console.log("\n⚠ Không tìm thấy IMAGE_GEN_API_KEY. Bỏ qua sinh ảnh tự động.");
  //   return;
  // }
  //
  // for (const item of prompts) {
  //   const fullPath = path.resolve(__dirname, "..", "public", item.targetPath.replace(/^\//, ""));
  //   if (fs.existsSync(fullPath)) {
  //     console.log(`⏭ Bỏ qua ${item.slug} – đã có ảnh`);
  //     continue;
  //   }
  //
  //   console.log(`🖼 Đang sinh ảnh cho ${item.slug}...`);
  //   const response = await fetch("https://api.openai.com/v1/images/generations", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${API_KEY}`,
  //     },
  //     body: JSON.stringify({
  //       model: "dall-e-3",
  //       prompt: item.prompt,
  //       n: 1,
  //       size: "1792x1024",
  //       quality: "standard",
  //     }),
  //   });
  //
  //   const data = await response.json();
  //   const imageUrl = data.data?.[0]?.url;
  //   if (!imageUrl) {
  //     console.error(`✘ Lỗi khi sinh ảnh cho ${item.slug}:`, data);
  //     continue;
  //   }
  //
  //   const imgResponse = await fetch(imageUrl);
  //   const buffer = Buffer.from(await imgResponse.arrayBuffer());
  //   fs.writeFileSync(fullPath, buffer);
  //   console.log(`✔ Đã lưu: ${fullPath}`);
  // }
}

main().catch(console.error);
