import { lib, game, ui, get, ai, _status } from "../../noname.js";
import { checkVersion, createProgress } from "../../noname/library/update.js";
import { EXTENSION_VERSION } from "./version.js";

// ============ 线上更新配置 ============
const EXTNAME = "TCK";
// 内置默认仓库根目录（GitHub raw / Gitee raw / 任意静态托管根目录都可以）。
// 也可以不写死：在扩展设置里点「更新源地址」填写后保存到 config，优先使用配置值。
export const DEFAULT_REPO = "https://raw.githubusercontent.com/ZiPncN/TCK/refs/heads/master";
// 镜像源前缀，顺序与 main/config.js 的 update_source 选项一致
const MIRRORS = ["", "https://gh-proxy.com/", "https://hk.gh-proxy.com/", "https://tvv.tw/"];
// 只属于本地开发的文件：不参与更新、也不会被清理逻辑误删
const LOCAL_ONLY = [
	/(^|\/)backup(\/|$)/i,
	/\.bak$/i,
	/^genManifest\.js$/,
	/^noname-kit\.history\.json$/i,
	/^manifest\.json$/i,
	/\.zip$/i,
	/^新建文件夹(\/|$)/,
	/^.git(\/|$)/,
	/(^|\/)_bak/i,
];
const isLocalOnly = (rel) => LOCAL_ONLY.some((re) => re.test(rel));

function getRepo() {
	const custom = String(lib.config[`extension_${EXTNAME}_update_repo`] || "")
		.trim()
		.replace(/\/+$/, "");
	return custom || DEFAULT_REPO;
}

// 询问是否更新：用系统 confirm，不碰游戏内 UI；点取消只是本次不更，下次启动会再问
function askUpdate(text) {
	return confirm(text);
}

// ============ 核心更新流程 ============
async function performUpdate(isManual, localVersion) {
	if (_status.connectMode && isManual) {
		alert("联机状态下无法更新");
		throw new Error("联机状态下无法更新");
	}
	if (!window.navigator.onLine && isManual) {
		alert("断网状态下无法检查更新，请检查网络连接");
		throw new Error("网络连接失败");
	}
	if (!isManual && sessionStorage.seer_check) return;

	const REPO = getRepo();
	if (!REPO) {
		if (isManual) {
			alert("还没有配置更新源地址。\n请在扩展设置里点「更新源地址」，填入仓库根目录（例如 GitHub raw 地址）。");
		}
		sessionStorage.seer_check = true;
		return;
	}

	// 获取清单：选中的源最先发，其余镜像 400ms 后并发抢跑，谁先成功用谁
	const mirrorList = REPO.includes("github.com") ? MIRRORS : [""];
	const primary = mirrorList[Number(lib.config[`extension_${EXTNAME}_update_source`]) || 0] ?? "";
	const attempts = [primary, ...mirrorList.filter((x) => x !== primary)].map(
		(u, i) =>
			new Promise((resolve, reject) => {
				setTimeout(async () => {
					try {
						const opt = { cache: "no-store" };
						if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) opt.signal = AbortSignal.timeout(8000);
						const r = await fetch(`${u}${REPO}/manifest.json`, opt);
						if (!r.ok) throw new Error(`HTTP ${r.status}`);
						resolve({ source: u, manifest: await r.json() });
					} catch (e) {
						reject(e);
					}
				}, i === 0 ? 0 : 400);
			}),
	);
	let picked = null;
	try {
		picked = await Promise.any(attempts);
	} catch (e) {
		console.warn("所有更新源均失败", e);
	}
	if (!picked) {
		const msg = "清单文件获取失败，请检查网络连接或更新源地址";
		if (isManual) alert(msg);
		throw new Error(msg);
	}
	const p = picked.source;
	const m = picked.manifest;
	console.log(`使用${p || "直连"}源获取清单成功`);

	// 本地版本更高时跳过（避免开发版被旧清单覆盖），同版本仍允许修复文件
	if (checkVersion(localVersion, m.version) > 0) {
		sessionStorage.seer_check = true;
		if (isManual) alert(`本地《${EXTNAME}》版本 ${localVersion} 高于仓库版本 ${m.version}，已跳过更新`);
		return;
	}

	// 逐个比对 SHA-1
	const hex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	const entries = Object.entries(m.files);
	const onlyCode = lib.config[`extension_${EXTNAME}_update_method`];
	const updateFiles = [];
	for (let i = 0; i < entries.length; i += 5) {
		const batch = entries.slice(i, i + 5);
		await Promise.all(
			batch.map(async ([f, h]) => {
				if (onlyCode && !f.endsWith(".js") && !f.endsWith(".css")) return;
				const path = `extension/${EXTNAME}/${f}`;
				if ((await game.promises.checkFile(path)) !== 1) {
					updateFiles.push(f);
					return;
				}
				try {
					const buf = await crypto.subtle.digest("SHA-1", await game.promises.readFile(path));
					const localHash = Array.from(new Uint8Array(buf), (x) => hex[x]).join("");
					if (localHash !== h) updateFiles.push(f);
				} catch {
					updateFiles.push(f);
				}
			}),
		);
	}

	sessionStorage.seer_check = true;
	if (updateFiles.length === 0) {
		if (isManual) alert("已经是最新版本，无需更新");
		return;
	}
	const okToUpdate = await askUpdate(
		`《${EXTNAME}》发现新版本 ${m.version}\n${updateFiles.length} 个文件需更新\n更新说明：\n${m.update || "无"}`,
	);
	if (!okToUpdate) return;

	let prog = createProgress(`更新 ${EXTNAME} 扩展`, updateFiles.length);
	try {
		// 带重试的下载
		async function downloadFileWithRetry(url, maxRetries = 3) {
			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					const r = await fetch(url);
					if (r.ok) return r;
					if (r.status === 429) {
						if (attempt === maxRetries) throw new Error(`请求过于频繁 (429)，已重试 ${maxRetries + 1} 次仍然失败`);
						const wait = Math.pow(2, attempt) * 1000;
						console.warn(`请求过于频繁，等待 ${wait / 1000} 秒...`);
						await new Promise((resolve) => setTimeout(resolve, wait));
						continue;
					}
					throw new Error(`HTTP ${r.status}`);
				} catch (e) {
					if (attempt === maxRetries) throw e;
					await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
				}
			}
		}

		// 递归创建目录
		async function ensureDir(dirPath) {
			let current = "";
			for (const part of dirPath.split("/")) {
				current += (current ? "/" : "") + part;
				try {
					await game.promises.createDir(current);
				} catch (e) {
					/* 已存在 */
				}
			}
		}

		for (let i = 0; i < updateFiles.length; i++) {
			const f = updateFiles[i];
			prog.setProgressValue(i + 1);
			prog.setFileName(`正在下载：${f}`);
			const fileUrl = encodeURI(`${p}${REPO}/${f}`);
			const r = await downloadFileWithRetry(fileUrl);
			const data = await r.arrayBuffer();
			const fullPath = `extension/${EXTNAME}/${f}`;
			const dir = fullPath.split("/").slice(0, -1).join("/");
			await ensureDir(dir);
			await game.promises.writeFile(data, dir, fullPath.split("/").pop());
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		// 清单最后写，中途失败还能重试
		await game.promises.writeFile(JSON.stringify(m, null, 2), `extension/${EXTNAME}`, "manifest.json");

		// 清理清单外的旧文件（本地开发文件除外）
		const clean = async (path, pre = "") => {
			const [dirs, files] = await game.promises.getFileList(path);
			let list = files.map((file) => (pre ? `${pre}/${file}` : file));
			for (const d of dirs) list = list.concat(await clean(`${path}/${d}`, pre ? `${pre}/${d}` : d));
			return list;
		};
		const fList = (await clean(`extension/${EXTNAME}`)).filter((file) => {
			if (file === "manifest.json") return false;
			if (m.files[file]) return false;
			if (isLocalOnly(file)) return false;
			if (onlyCode && !file.endsWith(".js") && !file.endsWith(".css")) return false;
			return true;
		});
		if (fList.length) {
			const cleanProg = createProgress("清理文件", fList.length);
			for (let i = 0; i < fList.length; i++) {
				cleanProg.setProgressValue(i + 1);
				try {
					await game.promises.removeFile(`extension/${EXTNAME}/${fList[i]}`);
				} catch (e) {
					console.warn(`清理文件失败: ${fList[i]}`, e);
				}
			}
			cleanProg.remove();
		}

		prog.remove();
		alert("更新完成！（将自动重启）");
		game.reload();
	} catch (e) {
		if (prog) prog.remove();
		throw e;
	}
}

// ============ 导出主函数 ============
export default async (b, localVersion = EXTENSION_VERSION) => {
	let autoUpdateQueue = Promise.resolve();

	if (b) {
		// 手动更新
		game.importedPack = true;
		try {
			await performUpdate(true, localVersion);
		} catch (e) {
			console.warn(e);
		} finally {
			game.importedPack = false;
		}
	} else {
		// 自动更新：排队并等待其他扩展的更新锁
		async function doAutoUpdate() {
			if (sessionStorage.seer_check) return;
			if (game.importedPack) {
				await new Promise((resolve) => {
					const check = () => {
						if (!game.importedPack) resolve();
						else setTimeout(check, 300);
					};
					check();
				});
			}
			game.importedPack = true;
			try {
				await performUpdate(false, localVersion);
			} finally {
				game.importedPack = false;
			}
		}
		autoUpdateQueue = autoUpdateQueue.then(() => doAutoUpdate()).catch(() => { });
		await autoUpdateQueue;
	}
};
