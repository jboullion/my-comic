## Current TODOs

- Try out other model generators? Perhaps set up a Replicate account to test?
- - Maybe we could set up a dropdown to use Fal, Replicate, OR Civitai? That might be a pita to manage

- Hide AI Generation for now?
- - Projects / Characters/ Project Settings
- - Give a warning that custom models take longer to load and have limited flexability. If you really want full control over your image generation you will likely want to work outside of Comic Book Maker and import your images.
- - We will update and improve our AI models and generation as the models themselves improve!

- Can we add NanoBanana? Any other models worth adding to default?


- Set up AI Dialog and Image Prompt helpers
- - Set up "Motion" / Video generation

- Improve the Asset toolbar experience

- Update the home and marketing page!



## Bugs

- Cloud SVG is overflowing container.
- Some actions don't seem to get caught in the undo. Is there a redo?
- I still get the forced zoom every now and then
- Potentially remove the PWA functionality to avoid weird issues like the target="_blank" issue Weigh the pros and cons again


## Ideas and Brainstorming

### General Concepts
- Set up the concept of a series?

### References

- Excalidraw 
- - They have an interesting shortcuts button which may be useful in the log run.

### Profile

- Update our profile page
- Delete profile / account
- Membership
- API Keys?
- Set up Supabase for saving projects in cloud?

### Mobile
- How do we want to handle mobile? Do we want to support it?


### UI / UX

- DESIGN REVAMP!
- - Public page layout and marketing
- - Privacy and contact page
- - Images for the header and other areas
  

- Allow page settings to have rounded edges? Same with export?

### Text

- We want Japanese and Korean comics to be made here.
- - How can we enable these languages?
- - Our Text effects will need to be in these languages as well

### Projects


- Have an alternate "Korean" aspect ratio / style which is essentially one long comic where the page transitions are vertical instead of page to page. Meant for digital and scrolling platforms.
- - I think we could still probably use the page concepts except ther would bea "preview" section where we could see the whole comic? Or at least scroll through it?
- - Perhaps we do only have one long panel and one long page? Ask AI

### Assets


### Canvas

- Toggle / Checkbox each corner for rounding. Users might only want to have one corner "rounded". We could even do each corner with separate rounding in an "advanced" mode.


### Export

- HTML export could have a "read" mode if wanted where each click shows the next panel? Or there is a next page button. The comic might have a button for how to read
- - Relatedly the user could enter a "Read" mode for their comic? Perhaps we even generate their comic for them and when they click on it we can display it for them? Perhaps in an iframe or something?
- - Or more likely just build a comic reader functionality inside of the comic maker. Problem there is it will be a different experience than the export if they export the index.html file. Ideally they would have the same experience as the users and only one codebase to manage.

### a11y

- Form field name / id for a11y purposes

- Move things with keyboard keys?

### Tools


### Testing

- Set up a testing system and write tests for a bunch of stuff


### Internationalization

I think a lot of people in other countries would like this application. Can I keep it in english only? There really isn't much to read. What is for reading should probably be auto transaltable to their language in their browser.


### AI TODOs


- AI Image Iteration. Could we take a base image and give a prompt for altering it using it as a reference?
- AI Inpainting
- Potentially remove image reference for "character" unless we can somehow use them just for character reference. Right now the total image has too much influence on the output that adding more than the description might not be helpful.
- - Tweak tweak tweak the character integration. THIS IS KEY

#### Images

CivitAI?!? Start with a "Bronze" membership during development and early alpha. Move to Silver + if and when needed.

Free Version: Allow users to hook up their own api? Perhaps only during beta / alpha. If a user is creating "adult" work you must use your own API key to generate images.

Once we create paid plans we could have a hobby / pro account for like $25/yr or $3/mo and $100/yr or $10/mo

We need to make sure to save these images locally for users so they are not auto deleted by CivitAI.


#### Prompt Helps

While Civitai is great for images with Fal.ai and Replicate we could also use LLM models for prompts and stories

Prompt agent which focuses on helping the user create consistant and useful prompts to generate images from


#### Story / Dialog

Story agent to be able to read / "see" a page or otherwise know about script / story and can help a user generate scripts and dialog or suggest other industry related things.


#### Character Prompts

For image consistance and Dialog consistancy.


#### Voice?!?

Could we set up the comic to "read"? Can each character have a voice? Plus a Narrator?



## Marketing

- Need a new logo.

- Work with a UI designer for help on improving logo and ui

- Callouts
- - Various Styles (Western, Japanese, Korean)
- - Save Unlimited Projects Locally!
- - Free plan, with Paid tiers later (start with Buy me a coffee?)
- - Use for story boarding as well!
- - Export static or "motion" comics.
- - Use the latest AI models for image generation and story / dialog assistance. (Pro)

