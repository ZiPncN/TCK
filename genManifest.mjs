// 生成本地发布的 manifest.json：版本 + 每个文件的 SHA-1
// 用法：node genManifest.js
//       node genManifest.js --note "本次更新说明"   → 同时写更新说明
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const EXT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = "manifest.json";

// 版本号只从 version.js 读取，不执行扩展代码
const versionSource = fs.readFileSync(path.join(EXT_DIR, "version.js"), "utf-8");
const versionMatch = versionSource.match(/EXTENSION_VERSION\s*=\s*(['"])(\d+(?:\.\d+)*)\1/);
if (!versionMatch) {
	throw new Error('无法读取 version.js 的 EXTENSION_VERSION，请写成 const EXTENSION_VERSION = "1.0.0";');
}
const VERSION = versionMatch[2];

const noteArgIndex = process.argv.indexOf("--note");
const UPDATE_NOTE = noteArgIndex > -1 ? process.argv[noteArgIndex + 1] || "" : "";

// 不发布的文件（与 update.js 的 LOCAL_ONLY 保持一致）
const SKIP = [
	/(^|\/)backup(\/|$)/i,
	/\.bak$/i,
	/^genManifest\.js$/,
	/^noname-kit\.history\.json$/,
	/^manifest\.json$/,
	/\.zip$/i,
	/^新建文件夹(\/|$)/,
	/^.git(\/|$)/,
	/(^|\/)_bak/i,
];
const isSkip = (rel) => SKIP.some((re) => re.test(rel));

function walkDir(dir, baseDir, fileList = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
		if (isSkip(relativePath)) continue;
		if (entry.isDirectory()) walkDir(fullPath, baseDir, fileList);
		else fileList.push(relativePath);
	}
	return fileList;
}

const baseDir = path.resolve(EXT_DIR);
const fileList = walkDir(baseDir, baseDir);
const files = {};
for (const relPath of fileList) {
	const filePath = path.join(baseDir, relPath);
	let buf = fs.readFileSync(filePath);
	// js/css 统一 LF，避免 Windows 换行影响哈希
	if (/\.(css|js)$/i.test(relPath)) {
		const content = buf.toString("utf-8");
		const normalized = content.replace(/\r\n|\r/g, "\n");
		if (normalized !== content) {
			fs.writeFileSync(filePath, normalized, "utf-8");
			console.log(`↻ 行尾已转换为 LF: ${relPath}`);
		}
		buf = Buffer.from(normalized, "utf-8");
	}
	files[relPath] = crypto.createHash("sha1").update(buf).digest("hex");
}

fs.writeFileSync(path.join(baseDir, OUTPUT), JSON.stringify({ version: VERSION, update: UPDATE_NOTE, files }, null, 2));
console.log(`✅ manifest.json 已生成：版本 ${VERSION}，${fileList.length} 个文件`);
