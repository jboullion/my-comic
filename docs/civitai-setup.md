# Civitai comic models via Fal

The site uses Fal for generation and Civitai for model files. No Civitai generation API or Buzz billing is involved. Both Generate and Advanced have a model-source dropdown and a model dropdown. Series settings can save a default model.

## Initial catalog

All three styles use `stabilityai/stable-diffusion-xl-base-1.0` on `fal-ai/lora` with one style LoRA, plus up to three selected character LoRAs.

| Style | Pinned Civitai version | Download access checked September 6, 2026 |
|---|---|---|
| Comic Book Illustration | [271577](https://civitai.com/models/240708?modelVersionId=271577) | Public |
| Comic Realism | [247021](https://civitai.com/models/219089?modelVersionId=247021) | Civitai key required |
| Comic Cover Maker | [503206](https://civitai.com/models/451944?modelVersionId=503206) | Civitai key required |

All three metadata/permission/download checks passed using the existing local Civitai credential. No model weights were downloaded and no paid generation was performed in that check. Visual quality and Fal loading remain to be verified with a live generation.

The shared catalog is `supabase/functions/_shared/comicModels.ts`. These are distinct style LoRAs on a fixed checkpoint, rather than three interchangeable checkpoints. Start here to keep character compatibility predictable. Changing a published preset's version changes later generations; prefer adding a new preset key for a new version.

## Enable on the existing Supabase project

Target the existing **staging** environment: [comic-book-maker.netlify.app](https://comic-book-maker.netlify.app/), backed by Supabase **My Comics** (`wehgqpwucgtldkxtqisy`). See [environment details](environments.md). There is no separate live production site yet.

1. In Supabase's Edge Function secrets, retain `FAL_AI_KEY` and add `CIVITAI_API_KEY` using the existing local credential. The values are in ignored `.env.local` under those server-only names. Do not paste them into chat or use `VITE_*` names. A new Civitai key can be created in [Civitai account settings](https://civitai.com/user/account) if needed.
2. Apply `supabase/migrations/011_add_comic_model_costs.sql` to the existing database. It adds three Fal model prices at five site credits each and preserves any prices already configured. This is a site pricing choice, not a claim about Fal's dollar price.
3. Deploy the updated `generate-image` function with its shared modules: `supabase functions deploy generate-image --project-ref YOUR_PROJECT_REF`.
4. Deploy the frontend after the function and migration. Restart any local Vite server after secret-name changes.
5. Sign in with a real test account, open AI Image, select **Civitai · via Fal**, and generate one image with **Comic Book Illustration**. Check image appearance, history, and the credit transaction. Repeat for the other presets and then with a compatible character LoRA. Real generations incur Fal charges.

The code is prepared locally; migration, secret installation, deployment, and end-to-end paid generation have not been performed.

## Characters

Create or edit a character, enter an explicit Civitai version URL, optional trigger words, and strength (0–1). Use a page URL containing `modelVersionId`, or an `/api/download/models/VERSION_ID` URL, without a token. Emptying the URL removes the assignment. Existing series exports already preserve these fields.

Select up to three characters when using Civitai models. The server resolves the actual version's `baseModel` and type; it does not trust a client architecture label. Only **SDXL 1.0 LoRAs** are accepted. Pony, Illustrious, FLUX, checkpoints, and unknown families are rejected before a paid Fal request. A character LoRA must advertise third-party hosted-generation permission (`Rent`), not only Civitai hosting (`RentCivit`). Metadata flags are checked live; review the linked creator's terms before expanding the catalog.

Trigger words are added automatically from version metadata when no override is supplied. Combining LoRAs can blend characters or overpower the style; reduce strengths or generate characters separately if necessary. LoRAs improve consistency but do not guarantee identity or associate each LoRA exclusively with one person in a multi-character image. Standard Fal models retain their existing prompt-based behavior and do not apply these LoRAs.

## Credentials and errors

Civitai authentication happens only in the Edge Function. It resolves the download redirect without following it with credentials, then supplies the signed file URL to Fal. API keys and signed downloads are not included in browser responses or history. Third-party request bodies are not logged. Expired, gated, removed, incompatible or disallowed models fail before submission. A Civitai outage therefore affects this optional source, while the standard Fal selections remain available.

Generation retains the site's current credit checking/deduction and polling flow. A timeout may still incur a Fal charge even though site credits are not deducted. The existing check-then-deduct flow is not a reservation system; concurrent spending and job recovery need a separate billing hardening change before scaling usage.

## Validation

Run `node --test tests/comic-models.test.mjs` (Node 24+) and `npm run build`. Tests cover version parsing, family mismatches, permissions, gated downloads, multiple LoRAs, strength limits, and credential isolation without a paid API call.

References: [Fal Stable Diffusion + LoRA schema](https://fal.ai/models/fal-ai/lora/api), [Civitai version metadata](https://github.com/civitai/civitai-developer-docs/blob/main/site/reference/model-versions.md).
