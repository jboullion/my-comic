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

To ensure characters look the same across panels, we will use the **IP-Adapter / Subject Reference** method:

1. **Reference Image:** User uploads/selects a "Character Sheet" (single image).  
2. **Implementation:** Pass the image URL into the image\_reference parameter of the Fal.ai model.  
3. **Prompting:** Use a unique "Trigger Name" (e.g., "Neon-Detective") in the text prompt to help the model associate the reference with the character.

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