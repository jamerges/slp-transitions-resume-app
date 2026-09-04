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
- `{"type":"tool","name":"..."}` mounts an interactive tool built in code. Allowed names are listed per lesson in the brief.

## Rules
1. Voice: content/writer-kit/voice.md and style.md, plus content/style-guide.md 8a/8b. Curious, first person where James has lived it, second person for the reader. Lead with the point in a warm full sentence. No "it's not X, it's Y". No em-dashes. No stage-setting ("here's the thing"). No corporate verbs. Specific SLP nouns (caseload, IEP, productivity, CF year, grad debt).
2. Every number, range, timeline and named fact must trace to content/research-facts.md, content/voc-2026-09-forums.md, or a file in content/course/research/. If you can't source it, don't say it. Never invent a person, a quote, or a statistic.
3. The path is optional. Principle lessons must work for any title. Use `paths` blocks to personalise instead of assuming a path.
4. Length: 500 to 900 words of prose per lesson (excluding scripts and examples). Six to ten blocks. One `callout` soft per lesson at most, one `quote` at most two.
5. Every lesson ends with something the reader can do this week (the `action`, or the last step).
6. Honesty rule: timelines 6–15 months, rejection as a volume statistic, the paths where a pay cut is expected are named as such.
