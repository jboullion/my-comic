# AI Image Generation

Generate comic images using AI with FLUX models. Access via the toolbar or press **A**.

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
| Model | AI model to use |
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
| Custom | Varies | Medium | 5 credits |

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

1. **Profile Image** - Upload a reference image for your character
2. **LoRA Model** - Use a trained LoRA from CivitAI for best results
3. **Trigger Word** - Automatically added to prompts when using LoRA

Set these in the Character settings when creating or editing a character.

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
