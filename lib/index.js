/**
 * Host half of @kongxiangyiren/dhs-theme-plugin: browser-independent persistence.
 * Themes are stored as standalone dsh.client bundle files — one .js file per
 * theme under `~/.dsh/dhs-theme-plugin-themes/` — with a small metadata index
 * at `~/.dsh/dhs-theme-plugin.json`. No upload size limit.
 *
 * Routes:
 *   GET  /api/theme-plugin             → { themes: [{id,name,active}], selected }
 *   GET  /api/theme-plugin/source?id=x → { ok, id, source } (one theme file)
 *   POST /api/theme-plugin             → save { themes:[{id,name,active,source?}], selected }
 *                                       (entries with `source` write/update their file;
 *                                        entries missing from the list get their file deleted)
 */
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

export default {
  inject: ["webServer"],
  apply(ctx) {
    const webServer = ctx.webServer;
    const HOME = resolveDshHome();
    const INDEX_FILE = join(HOME, "dhs-theme-plugin.json");
    const THEMES_DIR = join(HOME, "dhs-theme-plugin-themes");

    function themeFileName(id) {
      const name = String(id);
      const safe = name.replace(/[^\w-]/g, "_") || "theme";
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      return safe + "-" + h.toString(36) + ".js";
    }

    function saneEntry(e) {
      if (!e || typeof e !== "object" || Array.isArray(e)) return false;
      if (typeof e.id !== "string" || e.id.length === 0 || e.id.length > 128) return false;
      if (typeof e.name !== "string" || e.name.length === 0 || e.name.length > 128) return false;
      if (e.active !== undefined && typeof e.active !== "boolean") return false;
      if (e.source !== undefined && typeof e.source !== "string") return false;
      return true;
    }

    function normalize(data) {
      return {
        themes: Array.isArray(data && data.themes) ? data.themes.filter(saneEntry) : [],
        selected: data && typeof data.selected === "string" ? data.selected : null,
      };
    }

    async function readIndex() {
      try {
        return normalize(JSON.parse(await readFile(INDEX_FILE, "utf8")));
      } catch (err) {
        return { themes: [], selected: null };
      }
    }

    async function writeIndex(index) {
      await writeFile(INDEX_FILE, JSON.stringify(index, null, 2), "utf8");
    }

    async function writeThemeFile(file, source) {
      await mkdir(THEMES_DIR, { recursive: true });
      await writeFile(join(THEMES_DIR, file), source, "utf8");
    }

    async function removeThemeFile(file) {
      if (!file) return;
      try {
        await unlink(join(THEMES_DIR, file));
      } catch (err) {
        // already gone
      }
    }

    // 旧格式（条目内嵌 source）→ 拆成独立 .js 文件，一次完成
    async function migrateIfNeeded(index) {
      let changed = false;
      for (const t of index.themes) {
        if (typeof t.source === "string" && t.source.length > 0) {
          t.file = t.file || themeFileName(t.id);
          await writeThemeFile(t.file, t.source);
          delete t.source;
          changed = true;
        }
      }
      if (changed) await writeIndex(index);
      return index;
    }

    async function loadMeta() {
      const index = await migrateIfNeeded(await readIndex());
      return {
        themes: index.themes.map((t) => ({ id: t.id, name: t.name, active: t.active !== false })),
        selected: index.selected,
      };
    }

    async function loadSource(id) {
      const index = await readIndex();
      const entry = index.themes.find((t) => t.id === id);
      if (!entry || !entry.file) return null;
      try {
        return await readFile(join(THEMES_DIR, entry.file), "utf8");
      } catch (err) {
        return null;
      }
    }

    async function saveAll(themes, selected) {
      const index = await readIndex();
      const nextIds = new Set(themes.map((t) => t.id));
      for (const old of index.themes) {
        if (!nextIds.has(old.id)) await removeThemeFile(old.file);
      }
      const out = [];
      for (const t of themes) {
        const prev = index.themes.find((x) => x.id === t.id);
        let file = prev && prev.file;
        if (typeof t.source === "string" && t.source.length > 0) {
          file = file || themeFileName(t.id);
          await writeThemeFile(file, t.source);
        }
        out.push({ id: t.id, name: t.name, file, active: t.active !== false });
      }
      await writeIndex({ themes: out, selected: selected || null });
    }

    function readBody(req) {
      return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        req.on("error", reject);
      });
    }

    function sendJson(res, status, payload) {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(payload));
    }

    const disposeMeta = webServer.register({
      kind: "exact",
      path: "/api/theme-plugin",
      handler: async (req, res) => {
        try {
          if (req.method === "GET") {
            sendJson(res, 200, await loadMeta());
            return;
          }
          if (req.method === "POST") {
            const data = JSON.parse((await readBody(req)) || "{}");
            const themes = Array.isArray(data.themes) ? data.themes.filter(saneEntry) : [];
            const selected = typeof data.selected === "string" ? data.selected : null;
            await saveAll(themes, selected);
            sendJson(res, 200, { ok: true });
            return;
          }
          sendJson(res, 405, { ok: false, error: "method not allowed" });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });

    const disposeSource = webServer.register({
      kind: "exact",
      path: "/api/theme-plugin/source",
      handler: async (req, res) => {
        try {
          const url = new URL(req.url, "http://localhost");
          const id = url.searchParams.get("id");
          if (typeof id !== "string" || id.length === 0) {
            sendJson(res, 400, { ok: false, error: "missing id" });
            return;
          }
          const source = await loadSource(id);
          if (source === null) {
            sendJson(res, 404, { ok: false, error: "theme not found" });
            return;
          }
          sendJson(res, 200, { ok: true, id, source });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });

    return () => {
      disposeMeta();
      disposeSource();
    };
  },
};
