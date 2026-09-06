# AI Image Generation

Generate comic images using Fal models or curated Civitai comic-style LoRAs, all run through Fal. Access via the toolbar or press **A**.

## Getting Started

1. Click the **AI Image** button in the toolbar (or press A)
2. Enter a description of what you want to generate
3. Select a style preset
4. Click **Generate**
5. Once generated, click **Save to Canvas** to add the image

## Generation Modes

### Simple Mode (Generate Tab)

Quick generation with a single prompt:

| Field | Description |
|-------|-------------|
| Prompt | Describe what you want to see |
| Enhance | AI-powered prompt expansion for better results |
| Character | Select a character for consistent appearance |
| Style | Visual style preset |
| Model source | Fal.ai or Civitai via Fal |
| Model | Generation model or curated comic look |
| Size | Output dimensions |

### Advanced Mode

Structured prompts for more control:

| Field | Description |
|-------|-------------|
| Scene/Setting | Environment and background |
| Character/Subject | Who or what is in the image |
| Lighting/Atmosphere | Mood, time of day, lighting |
| Composition/Framing | Camera angle and composition |
| Style | Additional style notes (free text) |

Advanced mode also provides:
- Guidance scale (1-20)
- Inference steps (15-50)
- Seed for reproducibility
- Negative prompt

## Models

| Model | Quality | Speed | Cost |
|-------|---------|-------|------|
| FLUX 2 Pro | Highest | Slower | 8 credits |
| FLUX 2 Dev | High | Medium | 5 credits |
| Nano Banana | Good | Fastest | 2 credits |
| Comic Book Illustration (SDXL) | Illustrated comic style | Varies | 5 credits |
| Comic Realism (SDXL) | More realistic comic style | Varies | 5 credits |
| Comic Cover Maker (SDXL) | Comic-cover style | Varies | 5 credits |

Choose **Civitai · via Fal** in either generation tab to see the comic models. Each uses the same SDXL 1.0 base checkpoint with a different style LoRA. Set a starting model for a series in its AI Model settings. Model downloads must be enabled by the site administrator.

## Style Presets

| Style | Description |
|-------|-------------|
| Comic Book | Bold ink lines, cel-shaded, vibrant colors |
| Manga | Black and white, screentone, Japanese art style |
| Realistic | Photorealistic, detailed, high quality |
| Retro Comics | Vintage 1960s pop art, halftone dots |
| None | No style applied, raw prompt |

## Character Consistency

For consistent character appearance across images:

1. **LoRA Model** - In the character editor, paste a Civitai URL for a specific SDXL 1.0 LoRA version. Include `modelVersionId` in a model-page link, or use its download URL. Do not include API keys.
2. **Trigger Words** - Add an override, or leave blank to use the model version's trained words automatically.
3. **Strength** - Start at 0.8; reduce it if the character overwhelms the style.

Select up to three characters when using a Civitai comic model. FLUX, Pony and Illustrious LoRAs are incompatible with this initial catalog and will be rejected. The model must permit third-party hosted generation. Standard Fal models do not apply character LoRAs. Profile images are stored with characters but are not sent as image references by this generation flow.

LoRAs influence appearance, but cannot guarantee identical characters across images or prevent blending between multiple characters.

## Generation History

The History tab stores your last 20 generations:
- Click any entry to restore its settings
- View the full prompt used
- See model, seed, and style information
- Delete individual entries or clear all

## Tips for Better Results

- Be specific about composition and framing
- Include lighting and atmosphere details
- Use the Enhance button for more detailed prompts
- Try different models for different styles
- Save seeds for images you like to recreate variations
- Use character references for consistency across pages

## Credits

Each generation costs credits based on the model used. Your credit balance is shown in the modal. Credits are deducted when generation completes successfully.
