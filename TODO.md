## Current TODOs

- Token system refinement!
- - Should we list Nana Banana as the default?
- - Should we include other models besides Flux 2? 
- - How much is "10 tokens"? Maybe we give 20 tokens or we reduce the token cost of the models?
- - Don't charge anything for the image prompt suggestion? "Using the Enhance button to expand your prompt costs 1 credit."
- - Update credits to be 2, 4, 6.
- - Hobbyist gives "1000" credits? What does that equate to in generations? If they are paying $10 is that profitable for us?
- - Add a "Buy Credits" feature where a user can buy more credits if they want. $5 / 500, $10 / 1200, $20, 3000?

- Ability to change a project's series / attach a project to a series


## Bugs

- Have each AI Image generated save in a temporary storage so users can access it even if they don't use it. Perhaps save it and show it as a thumbnail in the history?
- Cloud SVG is overflowing container.
- Some actions don't seem to get caught in the undo. Is there a redo?
- I still get the forced zoom every now and then



## Ideas and Brainstorming


### General
- General refactor to clean up large files?
- Set up "Locations", and other things to work similar to characters for easy AI reference

- If Supabase is set up we could do things like Share Comics page and lots of other features.
- - Share Comics
- - Find Comics
- - Save information in DB


### Monitization

- Set up Stripe! Or other payment processor

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
- Membership

### Mobile



### UI / UX

- DESIGN REVAMP!
- - Public page layout and marketing
- - Privacy and contact page
- - Images for the header and other areas
  
- Allow page settings to have rounded edges? Same with export?


### Text



### Projects


- Have an alternate "Korean" aspect ratio / style which is essentially one long comic where the page transitions are vertical instead of page to page. Meant for digital and scrolling platforms.
- - I think we could still probably use the page concepts except ther would be a "preview" section where we could see the whole comic? Or at least scroll through it?
- - Perhaps we do only have one long panel and one long page? Ask AI

### Assets


### Canvas


- SVG "Tails".
- - Figure out some kind of tail system that will allow a user to draw a tail from any bubble to any point.
- - Tails should have standard points and also "bubble" tails if possible

- Toggle / Checkbox each corner for rounding. Users might only want to have one corner "rounded". We could even do each corner with separate rounding in an "advanced" mode.


### Export

- HTML export could have a "read" mode if wanted where each click shows the next panel? Or there is a next page button. The comic might have a button for how to read
- - Relatedly the user could enter a "Read" mode for their comic? Perhaps we even generate their comic for them and when they click on it we can display it for them? Perhaps in an iframe or something?
- - Or more likely just build a comic reader functionality inside of the comic maker. Problem there is it will be a different experience than the export if they export the index.html file. Ideally they would have the same experience as the users and only one codebase to manage.

### a11y

- Form field name / id for a11y purposes


### Tools


### Testing

- Set up a testing system and write tests for a bunch of stuff


### Internationalization



### AI

- AI Image Iteration. Could we take a base image and give a prompt for altering it using it as a reference?
- AI Inpainting
- Tweak tweak tweak the character integration. THIS IS KEY

- - Set up "Motion" / Video generation
- - AI Voice?!? Can we have AI Voices read the text / script and then also save the audio? Perhaps we save 1 audio file per page and as the user turns the page it plays that audio after a small delay?


- AI Documentation



# Security



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

- Use Cases
- - Comics (Of Course!) (Western, Japanese, Korean)
- - Story Boarding
- - Childrens books
- - Thumbnail Maker (YouTube) (Set up default "thumbnail" size?)


## Integrations

- Integrate with other Image providers or other systems?