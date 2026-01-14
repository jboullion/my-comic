## Current TODOs

- Token system refinement!
- - Should we list Nana Banana as the default?
- - Should we include other models besides Flux 2? 
- - How much is "10 tokens"? Maybe we give 20 tokens or we reduce the token cost of the models?

- Can this app even work in mobile? Perhaps mobile is a "view only" version?

- General refactor to clean up large files?

- Set up "Locations", and other things to work similar to characters for easy AI reference

- Delete Account

- If Supabase is set up we could do things like Share Comics page and lots of other features.
- - Share Comics
- - Find Comics
- - Save information in DB

- Ability to change a project's series / attach a project to a series



## Bugs

- Have each AI Image generated save in a temporary storage so users can access it even if they don't use it. Perhaps save it and show it as a thumbnail in the history?
- Cloud SVG is overflowing container.
- Some actions don't seem to get caught in the undo. Is there a redo?
- I still get the forced zoom every now and then



## Ideas and Brainstorming

### General Concepts


### Scripts
- Should we provide some kind of "Scripts" page?
- - Tied to a project
- - Perhaps a tool for writing comic scripts and dialog?
- - AI Could then reference and edit this as well


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


### AI

- AI Image Iteration. Could we take a base image and give a prompt for altering it using it as a reference?
- AI Inpainting
- Tweak tweak tweak the character integration. THIS IS KEY

- - Set up "Motion" / Video generation
- - AI Voice?!? Can we have AI Voices read the text / script and then also save the audio? Perhaps we save 1 audio file per page and as the user turns the page it plays that audio after a small delay?


- AI Documentation
- - Character documentation
- - Models and limitations
- - AI Prompt Suggestion
- - Story AI


# Security
- What happens if someone keeps sending bad prompts to fal or open router. Can that affect my account? How can we prevent that from being an issue?
- General abuse of tokens


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

