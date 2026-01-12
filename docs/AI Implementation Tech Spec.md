# **Technical Specification: Comic Maker AI Engine**

## **1\. Overview**

The Comic Maker app will utilize **Fal.ai** as the unified backend for generative media and storytelling assistance. The goal is to provide a seamless "one-click" workflow where users can maintain consistent characters across different artistic styles.

## **2\. Core Infrastructure**

* **Primary Engine:** Fal.ai (via @fal-ai/client).  
* **Database/Auth:** Supabase (PostgreSQL).  
* **Frontend:** React with Tailwind CSS.  
* **Backend Logic:** Supabase Edge Functions (Deno) to securely handle Fal.ai API keys.

## **3\. Image Generation Strategy**

We will use a tiered model approach to balance cost and quality.

### **3.1 Draft Mode (High Speed / Low Cost)**

* **Model:** fal-ai/flux/schnell or fal-ai/fast-sdxl.  
* **Purpose:** Rapid iteration, layout testing, and "Free" previews.  
* **Cost:** \~$0.001 \- $0.005 per generation.

### **3.2 Production Mode (High Quality)**

* **Model:** fal-ai/flux/dev or fal-ai/flux-pro.  
* **Customization:** Support for external Civitai LoRAs.  
* **NSFW Policy:** \- Default: enable\_safety\_checker: true.  
  * Mature Toggle (On): enable\_safety\_checker: false.  
  * For Pro models (Flux Pro): Set safety\_tolerance: 6 (highest allowance).

### **3.3 Character Consistency Workflow**

Character consistency is achieved through a two-phase approach:

#### **Phase 1: Text + LoRA Generation (Current)**

1. **Character Descriptions:** When characters are selected, their descriptions are appended to the prompt automatically ("Characters in scene: Hero: Tall muscular man with blue cape...").
2. **LoRA Integration (Custom Models Only):** Users can configure character-specific LoRAs from CivitAI for SDXL/Pony models. LoRAs are NOT compatible with FLUX models.
   - Trigger word auto-prepended to prompt
   - Scale controls LoRA strength (0-1)
3. **Profile Images:** Character profile images are for USER REFERENCE ONLY during this phase - they are NOT sent to the AI. This helps users remember what the character looks like while prompting.

**LoRA Compatibility:**
- ✅ Custom SDXL/Pony models: Full LoRA support
- ❌ FLUX models: No LoRA support (architecture incompatible)

The UI hides LoRA controls when FLUX models are selected.

#### **Phase 2: Face Correction with FLUX Kontext (Future)**

After initial generation, users can correct faces/identity using FLUX Kontext:

1. **Select Generated Image:** User identifies a panel needing face correction.
2. **Apply Character Reference:** System uses the character's profile image as reference.
3. **Inpainting with Kontext:** Call `fal-ai/flux-pro/kontext/max` to inpaint the face region while preserving the rest of the image.
4. **Natural Language Control:** Prompt like "Make this character's face match the reference photo"

**Benefits of this approach:**
- Clean initial generation without reference artifacts
- Precise control over when identity matching is applied
- Kontext preserves image quality and style
- Works with any initial generation model

## **4\. Text & Story Assistant**

We will use Fal's LLM endpoints to provide context-aware storytelling.

* **Endpoint:** fal-ai/any-llm.  
* **Models:** \- meta-llama/llama-3.2-70b-instruct (Deep creative writing).  
  * anthropic/claude-3.5-sonnet (Complex plot logic).  
* **Features:**  
  * **Prompt Engineer:** Converts "Robot guy in rain" to "Cinematic high-contrast comic panel, cel-shaded, 90s ink style, robot detective..."  
  * **Dialogue Buddy:** Suggests text for speech bubbles based on previous panels.

## **5\. Video Generation (Future Phase)**

* **Model:** fal-ai/veo3/fast or fal-ai/kling-video.  
* **Workflow:** "Image-to-Video." Users select a finished comic panel and animate it into a 5-second cinematic clip.  
* **Cost:** \~$0.20 \- $0.75 per generation (charged separately from image credits).

## **6\. Monetization & Credits Logic**

Managed via Supabase profiles table.

| User Tier | AI Access | Monthly Credits | Overages |
| :---- | :---- | :---- | :---- |
| **Free** | View Only | 0 | Not Available |
| **Paid Member** | Full Access | 500 Credits | Buy 100 for $5 |
| **Pro Artist** | Priority Queue | 2,000 Credits | Buy 500 for $15 |

### **Credit Consumption Logic:**

* 1 Draft Image \= 1 Credit.  
* 1 Production Image \= 5 Credits.  
* 1 Video Clip \= 50 Credits.

## **7\. Security & API Masking (Rule of Backend)**

**MANDATORY:** Do not call Fal.ai directly from the browser in production.

1. **Request:** Frontend sends prompt/settings to Supabase Edge Function.  
2. **Validation:** Edge Function checks user auth and credits.  
3. **Execution:** Edge Function injects FAL\_KEY and calls Fal.ai.  
4. **Storage:** Edge Function saves result URL to Supabase panels table and returns it to UI.

## **8\. Civicai LoRA Integration**

Advanced users can input a Civitai Version ID.

* **Mapping:** App converts ID to download URL: https://civitai.com/api/download/models/{VERSION\_ID}.  
* **API Call:** The URL is passed as an object in the loras array of the Fal.ai request.

## **9\. Voice AI (Optional / Long Term)**

### **9.1 Overview**

Enable a "Read Mode" where AI narrates comic dialog and narrative text aloud.

* **Primary Model:** fal-ai/dia-tts (multi-speaker dialogue).
* **Fallback Model:** fal-ai/orpheus-tts (emotional presets).
* **Use Case:** Accessibility, immersive reading, content preview.

### **9.2 Model Selection**

| Model | Endpoint | Cost | Best For |
| :---- | :---- | :---- | :---- |
| **Dia TTS** | fal-ai/dia-tts | $0.04/1K chars | Multi-character dialogue |
| **Orpheus TTS** | fal-ai/orpheus-tts | $0.05/1K chars | Emotional narration |

### **9.3 Voice Mapping Strategy**

**Character Voices:**

1. Each character gets a unique voice via Dia voice cloning.
2. User uploads/records a voice sample per character.
3. System stores voice reference in character profile.

**Element Type Mapping:**

* **Speech Bubbles:** Character's cloned voice with speaker tag.
* **Narrative Boxes:** Dedicated "Narrator" voice (neutral tone).
* **Text Effects (POW!/BAM!):** Dramatic voice with emphasis.

### **9.4 Text Processing Pipeline**

1. **Extract:** Collect all text elements from page in z-order.
2. **Format:** Convert to Dia TTS format:
   ```
   [S1] Hero dialog here. (laughs)
   [S2] Villain response here.
   [NARRATOR] Meanwhile, in the city...
   ```
3. **Generate:** Call fal-ai/dia-tts with formatted script.
4. **Cache:** Store audio URL in page metadata for replay.

### **9.5 API Integration**

**Dia TTS Request:**

```javascript
const result = await fal.subscribe("fal-ai/dia-tts", {
  input: {
    text: "[S1] I'll save the city! [S2] Not if I stop you first. (evil laugh)"
  }
});
// Returns: { audio: { url: "https://...", content_type: "audio/mpeg" } }
```

**With Voice Cloning:**

```javascript
const result = await fal.subscribe("fal-ai/dia-tts/voice-clone", {
  input: {
    text: "[S1] My signature line!",
    ref_audio_url: "https://storage.../character-voice-sample.mp3",
    ref_text: "This is the reference text matching the audio sample."
  }
});
```

### **9.6 Credit Consumption**

| Action | Credits |
| :---- | :---- |
| 1 Page Narration (avg 500 chars) | 5 Credits |
| Voice Clone Setup | 10 Credits |
| Re-generate Page Audio | 5 Credits |

### **9.7 UI Components (Future)**

* **Read Mode Toggle:** Play/pause button in page toolbar.
* **Voice Settings:** Per-character voice assignment in Character panel.
* **Audio Timeline:** Scrubber synced to panel highlights.
* **Speed Control:** 0.5x to 2x playback speed.

### **9.8 Implementation Phases**

**Phase A: Basic Narration**

* Single narrator voice for all text.
* Sequential page-by-page playback.
* No voice cloning.

**Phase B: Character Voices**

* Multi-speaker with Dia \[S1\]/\[S2\] tags.
* Voice cloning per character.
* Speaker assignment UI.

**Phase C: Interactive Read Mode**

* Panel-by-panel highlighting during playback.
* Audio timeline with seek.
* Export audio with comic (MP4/video).

## **10\. Motion Animation (Optional / Long Term)**

### **10.1 Overview**

Add subtle ambient motion to static comic images, creating "living" panels where hair blows, smoke wafts, leaves rustle, and environments feel alive.

* **Primary Model:** fal-ai/ltx-video/image-to-video (cost-effective).
* **Alternative Model:** fal-ai/wan/v2.2-a14b/image-to-video (fine control).
* **Use Case:** Ambient motion, cinemagraph-style effects, immersive reading.

### **10.2 Model Selection**

| Model | Endpoint | Cost | Best For |
| :---- | :---- | :---- | :---- |
| **LTX Video** | fal-ai/ltx-video/image-to-video | $0.02/video | Cost-effective subtle motion |
| **WAN 2.2** | fal-ai/wan/v2.2-a14b/image-to-video | $0.04-$0.08/sec | Fine motion control |

### **10.3 Workflow**

1. **Select:** User clicks "Add Motion" button on an image element.
2. **Describe:** Prompt dialog appears for motion description.
3. **Generate:** Send image + prompt to LTX Video API.
4. **Save:** Store resulting video as new asset in gallery.
5. **Replace:** Swap static image element with looping video.

### **10.4 Motion Prompt Examples**

| Effect | Prompt |
| :---- | :---- |
| Hair/Cloth | "Hair gently blowing in a light breeze, fabric rippling softly" |
| Smoke/Steam | "Wisps of smoke rising slowly, steam drifting upward" |
| Nature | "Leaves rustling gently, grass swaying in the wind" |
| Water | "Water surface with subtle ripples, gentle reflections" |
| Atmosphere | "Dust particles floating in light beam, slow ambient drift" |
| Fire/Glow | "Flames flickering gently, warm light pulsing softly" |

**Prompt Tips:**

* Use "slowly", "gently", "subtly" for ambient effects.
* Specify "static camera" or "fixed shot" to prevent camera movement.
* Describe only the elements that should move.

### **10.5 API Integration**

**LTX Video Request:**

```javascript
const result = await fal.subscribe("fal-ai/ltx-video/image-to-video", {
  input: {
    prompt: "Hair gently blowing in breeze, static camera, subtle movement",
    image_url: "https://storage.../panel-image.png",
    negative_prompt: "fast motion, camera shake, dramatic movement",
    num_inference_steps: 30,
    guidance_scale: 3
  }
});
// Returns: { video: { url: "https://...", content_type: "video/mp4" } }
```

**WAN 2.2 Request (Fine Control):**

```javascript
const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
  input: {
    prompt: "Smoke rising slowly, fixed shot, gentle ambient motion",
    image_url: "https://storage.../panel-image.png",
    num_frames: 81,
    frames_per_second: 16,
    resolution: "720p"
  }
});
```

### **10.6 Asset Management**

**Storage Strategy:**

* Original static image preserved in gallery.
* Animated version saved as separate video asset.
* Link between static and animated versions for easy switching.

**Element Handling:**

* Extend image element to support video sources.
* Add `isAnimated` flag and `videoUrl` property.
* Video elements auto-loop with no controls visible.

### **10.7 Credit Consumption**

| Action | Credits |
| :---- | :---- |
| Add Motion (LTX Video) | 10 Credits |
| Add Motion (WAN 2.2 - 5 sec) | 25 Credits |
| Re-generate Motion | 10 Credits |

### **10.8 Export Considerations**

| Export Type | Handling |
| :---- | :---- |
| Static Image (PNG/JPEG) | Use first frame of video |
| Animated Page (GIF) | Composite all animated elements |
| Video Export (MP4) | Full motion with audio (if enabled) |

### **10.9 Implementation Phases**

**Phase A: Basic Motion**

* "Add Motion" button on image elements.
* Simple prompt input dialog.
* LTX Video integration only.
* Replace image with video in-place.

**Phase B: Motion Presets**

* Pre-built prompt templates (hair, smoke, water, etc.).
* Motion intensity slider (subtle → moderate).
* Preview before applying.

**Phase C: Advanced Controls**

* WAN 2.2 integration for fine control.
* Custom duration and frame rate.
* Motion masking (animate only part of image).