## Current TODOs

- Potentially remove the PWA functionality to avoid weird issues like the target="_blank" issue Weigh the pros and cons again

- Create a various instructions files

- Create a features agent which knows to add to our documentation page and other common things we need to do for tasks. Perhaps it even knows to check out a branch...request a PR...? Can we use a GitHub MCP to create PRs?

- Add a cover feature which shows up on the projects page.

- Show available space if possible somewhere so a user doesn't fill up their indexDB.

## Bugs

- - Cloud SVG is overflowing container.
- Fix the projects page. Broken layout.
- - Could probably just do a general refactor.
- - Setup project settings page. Including Thumbnail / cover
- Some actions don't seem to get caught in the undo. Is there a redo?
- I still get the forced zoom every now and then

## Ideas and Brainstorming

### References

- Excalidraw 
- - They have an interesting shortcuts button which may be useful in the log run.


### UI / UX

- Allow page settings to have rounded edges? Same with export?

### Text

- We want Japanese and Korean comics to be made here.
- - How can we enable these languages?
- - Our Text effects will need to be in these languages as well

### Projects

- Reorder pages

- Have an alternate "Korean" aspect ratio / style which is essentially one long comic where the page transitions are vertical instead of page to page. Meant for digital and scrolling platforms.
- - I think we could still probably use the page concepts except ther would bea "preview" section where we could see the whole comic? Or at least scroll through it?
- - Perhaps we do only have one long panel and one long page? Ask AI

### Assets

- Need a search system.
- Search by name. Filter by pages placed on and date added
- We DO have limits on space with IndexDB and so we might need to warn users or ask users to install locally if they want to have more working space.

### Canvas

- Increase drag handle size

- Toggle / Checkbox each corner for rounding. Users might only want to have one corner "rounded". We could even do each corner with separate rounding in an "advanced" mode.



### Export

- HTML export could have a "read" mode if wanted where each click shows the next panel? Or there is a next page button. The comic might have a button for how to read
- 

### a11y

- Form field name / id for a11y purposes

- Move things with keyboard keys?

### Tools


### Internationalization

I think a lot of people in other countries would like this application. Can I keep it in english only? There really isn't much to read. What is for reading should probably be auto transaltable to their language in their browser.


### AI

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

Could we set up the comic to "read"



## Marketing

- Various Styles (Western, Japanese, Korean)
- Save Unlimited Projects Locally!
- Free plan, with Paid tiers later (start with Buy me a coffee?)
- Use for story boarding as well!
- Export static or "motion" comics.
- Use the latest AI models for image generation and story / dialog assistance. (Pro)

