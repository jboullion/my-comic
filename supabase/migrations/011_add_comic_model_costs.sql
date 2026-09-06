-- Fal executes these pinned Civitai SDXL LoRAs. Site credits are separate from Fal charges.
INSERT INTO public.ai_model_costs (provider, model_key, display_name, cost_tokens)
VALUES
  ('fal', 'civitai-illustration', 'Comic Book Illustration', 5),
  ('fal', 'civitai-realism', 'Comic Realism', 5),
  ('fal', 'civitai-cover', 'Comic Cover Maker', 5)
ON CONFLICT (provider, model_key) DO NOTHING;
