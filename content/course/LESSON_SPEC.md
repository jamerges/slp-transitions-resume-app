# Transition OS lesson content spec (for writers)

Each module is one JSON file: `content/course/modules/module-N.json`, an array of lessons.
The app renders it; nothing else is needed for a lesson to appear. Keep every lesson
skimmable: a reader should get the point from the TL;DR and the headings alone.

## Lesson object
```json
{
  "id": "2.2",
  "tldr": "One or two sentences. The whole lesson in the time it takes to read a text message.",
  "blocks": [ ...see block types... ],
  "action": { "label": "Button text, 2-5 words, never changes", "prompt": "What to do, concretely, this week.", "done": "One warm line shown after they do it." },
  "takeaways": ["3 to 5 one-line takeaways, each a full sentence"],
  "sources": ["facts", "forums", "bls", "onet", ...]
}
```
`id` must match a lesson id in lib/course.ts. `action` is required for lessons whose type is
"action" and optional elsewhere. `takeaways` are required.

## Block types
- `{"type":"p","text":"..."}` paragraph. Inline **bold** and *italic* allowed (markdown-lite), nothing else.
- `{"type":"h","text":"..."}` a section heading (sentence case, a plain statement or a question).
- `{"type":"list","items":["...","..."]}` bullet list, each item one sentence or a fragment.
- `{"type":"steps","items":["...","..."]}` numbered steps, each starting with a verb.
- `{"type":"numbers","items":[{"value":"$84k–$135k","label":"clinical liaison, documented range"}]}` 2–4 stat tiles. Every value must trace to a source.
- `{"type":"quote","text":"...","from":"a school SLP, r/slp"}` a verbatim quote from content/voc-2026-09-forums.md or research-facts.md. Never invent one. No usernames.
- `{"type":"callout","tone":"soft|warm","title":"...","text":"..."}` soft = the key idea; warm = a caveat or warning.
- `{"type":"example","title":"...","before":"...","after":"..."}` a before/after pair (résumé bullets, messages, answers).
- `{"type":"script","title":"...","text":"..."}` a copyable template (a message, a bridge statement). Use [brackets] for the parts they fill in.
- `{"type":"story","name":"...","was":"...","now":"...","text":"...","href":"..."}` a real person from the site; only the six with published stories (Caitlin Mueller, Lindsey Ison, Bethany Riebock, Jeannette Roberes, Rachel Archambault, Mattie Murrey-Tegels) plus quoted transitioners from research-facts (unnamed).
- `{"type":"paths","note":"..."}` renders the path cards for the reader's chosen path (or top dials); the note is one line of context.
- `{"type":"bypath","title":"...","note":"...","items":{"customer-success":"...","liaison-ur":"..."}}` one copyable script per path, keyed by the quiz slug (lib/quiz.ts PATHS). The reader's own path opens first; chips switch. Use it for pitches, headlines, anything that changes wording by path but not by lesson.
- `{"type":"ask","label":"...","prompt":"...","lines":3}` one written answer. It saves as the reader types (`shared.notes[lessonId]`). To show it in the workbook, give an action in `components/course/workbook-model.ts` a `write` with `note` set to the lesson id. Every lesson with no tool, script or action ends with one, placed last: the prompt asks for the decision the lesson makes possible, in one or two sentences, and the label is that decision as a noun phrase. One per lesson.
- `{"type":"tool","name":"..."}` mounts an interactive tool built in code. Allowed names are listed per lesson in the brief. `contact-tracker` is the shared people list (finish = three messages sent) and is mounted ONLY in 3.3; `contact-tracker-warm` is the same list with the 3.6 finish (two conversations warm), mounted in 3.6 and on /course/tracker; `application-tracker` is mounted only in 4.7 and on /course/tracker. Other lessons link to `/course/tracker` through the `R.lists` resource rather than mounting a second copy. `prompt-kit` is the 3.8 prompt set filled with the reader's path and numbers. One tool per job: do not add a second tool for a decision an existing one already makes.

## Visual blocks (added 2026-11-21)
James: "more visual, less walls of text". Use these where the content already has the shape. They carry the same facts as the prose they replace, never new ones.
- `{"type":"compare","title":"...","left":{"label":"Instead of","items":["..."]},"right":{"label":"Try","items":["..."]}}` two columns set against each other: what most people do and what works, what they say and what it means, before and after as lists. Two to four items a side, each under 18 words. Labels are yours to choose and stay under four words.
- `{"type":"flow","title":"...","items":[{"label":"Industry","note":"health tech, ed tech or devices"}]}` a sequence drawn left to right with arrows (stacked on a phone): a search order, a funnel, the stages of a hiring process. Three to five items. `label` is one to four words, `note` is optional and under 14 words.
- `{"type":"cards","items":[{"title":"...","text":"..."}]}` two to four parallel ideas side by side, where a list would have been four small paragraphs. `title` under six words, `text` under 30.
- `{"type":"check","items":[{"q":"...","options":["...","...","..."],"answer":1,"why":"..."}]}` one or two questions that make the reader use the lesson, placed near the end, before the final `ask` or tool. Write a situation and ask what to do ("A form asks for your expected salary. What goes in the box?"), never a recall question about the lesson itself. Three options, all plausible, one clearly best by what the lesson says. `answer` is the index of the best one. `why` is one sentence that says why, in the lesson's own terms. Every lesson gets one `check` block.

## How a lesson opens (2026-11-21)
Every lesson opens in its short view, with or without a video: the TL;DR, the takeaways as key points, then each section as its heading plus whatever in it can be done, copied or looked at (`tool`, `ask`, `script`, `bypath`, `steps`, `numbers`, `example`, `paths`, `compare`, `flow`, `cards`, `check`, warm `callout`). A section's prose (`p`, `list`, `quote`, soft `callout`, `story`) sits behind a "Read this part" tap, and "Full lesson" opens all of it. So:
- **A heading must work alone.** It is a plain sentence to the reader about their situation or what to do ("Send the first message to someone you already know"), never a label for the section ("Warm outreach", "Overview", "Why this matters") and never a comment on the lesson.
- **The first sentence under a heading is shown as its teaser.** Make it the point of the section.
- Anything the reader must not miss goes in a block that shows in the short view, not in a paragraph.

## Length (2026-11-21)
A lesson carries at most 700 words of prose (`p`, `list`, `quote`, soft `callout`). Cut stage-setting, repeated points and sentences that announce what is coming. Keep every number, script, example, quote, tool and `ask`.

## Checking a module
`python3 scripts/check_lessons.py` checks every module file against this spec and against the last commit: block shapes, em dashes, takeaway counts, one `check` per lesson, prose length, and that no tool, script, example, `ask` or stat value was lost.

## Video and the short version
A lesson with a video (an entry in `lib/course-videos.ts`) shows the video first, above the short view described above. Before 2026-11-21 only lessons with a video opened short: the TL;DR, the takeaways as key points, and only the blocks a reader does or copies (`tool`, `ask`, `script`, `bypath`, `steps`, `numbers`, `example`, `paths`, warm `callout`). Prose (`p`, `list`, `quote`, soft `callout`, `story`) shows in the full lesson. So write every `steps`, `script` and `ask` to make sense without the paragraph above it, and put anything a reader must not miss in a warm callout or the takeaways. The video's script lives in `content/course/video-scripts.md` and says nothing the lesson does not.

## Rules
1. Voice: content/writer-kit/voice.md and style.md, plus content/style-guide.md 8a/8b. Curious, first person where James has lived it, second person for the reader. Lead with the point in a warm full sentence. No "it's not X, it's Y". No em-dashes. No stage-setting ("here's the thing"). No corporate verbs. Specific SLP nouns (caseload, IEP, productivity, CF year, grad debt).
2. Every number, range, timeline and named fact must trace to content/research-facts.md, content/voc-2026-09-forums.md, or a file in content/course/research/. If you can't source it, don't say it. Never invent a person, a quote, or a statistic.
3. The path is optional. Principle lessons must work for any title. Use `paths` blocks to personalise instead of assuming a path.
4. Length: at most 700 words of prose per lesson (see Length above). One `callout` soft per lesson at most, `quote` at most two.
5. Every lesson ends with something the reader can do this week (the `action`, or the last step).
6. Honesty rule: timelines 6–15 months, rejection as a volume statistic, the paths where a pay cut is expected are named as such.
