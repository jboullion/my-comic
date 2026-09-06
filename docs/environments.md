# Project environments

This personal project currently has local development and staging only. There is no separate live production environment.

## Staging

| Service | Project | Identifier / URL |
|---|---|---|
| Website | Comic Book Maker staging | https://comic-book-maker.netlify.app/ |
| Netlify | `comic-book-maker` | Site ID: `c86ca164-073f-4479-a05c-13d29061e36b` |
| Netlify dashboard | Existing site | https://app.netlify.com/projects/comic-book-maker |
| Supabase | `My Comics` | Project ref: `wehgqpwucgtldkxtqisy` |
| Supabase API | Existing backend | https://wehgqpwucgtldkxtqisy.supabase.co |
| Supabase dashboard | Existing project | https://supabase.com/dashboard/project/wehgqpwucgtldkxtqisy |
| Git repository | `jboullion/my-comic` | https://github.com/jboullion/my-comic |

The user identified the website as staging. Both service connections and project identities were verified through their MCP tools on September 6, 2026. Local `.env.local` points to this same Supabase project: local frontend development currently shares the staging backend, rather than using a separate local Supabase instance.

## Deployment terminology

Netlify calls the deployment context for the primary site URL **production**. For this project, that primary URL is the **staging** site above. `netlify deploy --prod` would update staging; it does not indicate that a separate live site exists. A draft deploy gets a separate preview URL.

The inspected Netlify deployment was ready, built from `main` at commit `2212cb71838777f6a35a7ec0ad1fb5b160479da5`, published April 10, 2026. This is an inspection snapshot, not a permanent deployment target. Deploying an existing Git commit will not include uncommitted local changes.

`netlify.toml` runs `npm run build`, publishes `dist`, and provides the React Router SPA fallback. Keep real authentication enabled in hosted builds; `VITE_SKIP_AUTH` is only for isolated local UI testing.

## Backend snapshot

The connected Supabase project was healthy and had five active Edge Functions: `generate-image`, `story-chat`, `get-credits`, `enhance-prompt`, and `delete-account`.

The inspected `generate-image` function was version 7. Its gateway `verify_jwt` flag was false, but the function validates the bearer token with `supabase.auth.getUser()` before generation. Preserve application authentication when deploying updates.

The Fal credit catalog contained the original four model keys (`custom`, `flux-2`, `flux-2-pro`, `nano-banana`). The new Civitai catalog entries were not yet installed at inspection time.

## Credentials and next rollout

Keep API credentials in ignored local environment files or Supabase Edge Function secrets. These documentation identifiers are not credentials. The MCP connections provide project access but do not imply that either local CLI is authenticated or linked.

The local Netlify CLI was authenticated on September 6, 2026, and this folder was linked to site `c86ca164-073f-4479-a05c-13d29061e36b` (`comic-book-maker`). Local link state lives in ignored `.netlify/state.json`. Use `netlify status` to check the current login and link before deploying. The MCP connection works independently; triggering a Git build through MCP builds committed repository contents, while a CLI deploy can upload a local build.

For the Civitai feature, follow [Civitai setup](civitai-setup.md): install the `CIVITAI_API_KEY` secret in this Supabase project, apply the comic model credit migration, deploy `generate-image`, then deploy the frontend and test a generation. Inspect the existing remote function before replacing it to preserve any remote-only changes.
