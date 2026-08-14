/**
 * Host half of @kongxiangyiren/dhs-theme-plugin: browser-independent persistence.
 * A tiny webServer route persists uploaded themes to a data file under the
 * DSH home (`~/.dsh/dhs-theme-plugin.json`), so switching browsers or clearing
 * browser data does not lose themes, and the workspace stays clean.
 * The client bundle calls GET/POST /api/theme-plugin.
 */
import { join } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

export default {
  inject: ["webServer", "fs", "sandboxPolicy"],
  apply(ctx) {
    const webServer = ctx.webServer;
    const fs = ctx.fs;
    const policy = ctx.sandboxPolicy;
    const FILE_PATH = join(resolveDshHome(), "dhs-theme-plugin.json");

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

    function saneEntry(e) {
      if (!e || typeof e !== "object" || Array.isArray(e)) return false;
      if (typeof e.id !== "string" || e.id.length === 0 || e.id.length > 64) return false;
      if (typeof e.name !== "string" || e.name.length === 0 || e.name.length > 64) return false;
      if (typeof e.source !== "string" || e.source.length === 0 || e.source.length > 200000) return false;
      if (e.active !== undefined && typeof e.active !== "boolean") return false;
      return true;
    }

    function normalize(data) {
      return {
        themes: Array.isArray(data && data.themes) ? data.themes.filter(saneEntry) : [],
        selected: data && typeof data.selected === "string" ? data.selected : null,
      };
    }

    async function writeStored(themes, selected) {
      const target = await fs.resolve(FILE_PATH);
      await fs.writeText(
        target,
        JSON.stringify({ themes, selected }, null, 2),
        undefined,
        undefined,
        policy.resolve({ mode: "danger-full-access" }),
      );
    }

    async function loadStored() {
      try {
        const target = await fs.resolve(FILE_PATH);
        const text = await fs.readText(target);
        return normalize(JSON.parse(text));
      } catch (err) {
        return { themes: [], selected: null };
      }
    }

    return webServer.register({
      kind: "exact",
      path: "/api/theme-plugin",
      handler: async (req, res) => {
        try {
          if (req.method === "GET") {
            sendJson(res, 200, await loadStored());
            return;
          }
          if (req.method === "POST") {
            const body = await readBody(req);
            const data = JSON.parse(body || "{}");
            const themes = Array.isArray(data.themes) ? data.themes.filter(saneEntry) : [];
            const selected = typeof data.selected === "string" ? data.selected : null;
            await writeStored(themes, selected);
            sendJson(res, 200, { ok: true });
            return;
          }
          sendJson(res, 405, { ok: false, error: "method not allowed" });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });
  },
};
