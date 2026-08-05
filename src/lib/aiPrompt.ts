import { SCW_ICON_NAMES } from './scwIcons'

const ICON_LIST = SCW_ICON_NAMES.map((name) => `scw:${name}`).join(', ')

export const DIAGRAM_PROMPT = `You are helping me create an architecture diagram in D2 (https://d2lang.com), a text-based diagramming language, so I can paste the result into the Scaleway D2 Diagram Editor (a browser-based D2 editor with a curated set of Scaleway product icons).

## D2 basics

- Declare a shape: \`name: Label\`
- Nest shapes into containers: \`parent.child: Label\`
- Connect shapes: \`a -> b\` (optionally \`a -> b: label\`)
- Attach an icon to a shape: \`name: Label { icon: scw:<icon-name> }\`
- Full syntax reference: https://d2lang.com/tour/intro
- Icons reference: https://d2lang.com/tour/icons
- Try things live: https://play.d2lang.com

## Available Scaleway icons

Only use icon names from this exact list (as \`icon: scw:<name>\`), and only when there's a genuinely good match for the component — omit the \`icon\` field entirely rather than guessing a name that isn't in this list:

${ICON_LIST}

## How to help me

1. If I attach an image of an architecture I want reproduced: analyze it (services/components, groupings, connections, direction of data flow, labels) and produce a best-effort D2 diagram from it, then briefly ask me if anything needs correcting.
2. If I haven't attached an image (or I ask you to help me design something new): ask me short, focused clarifying questions **one at a time** — what components/services are involved, how they connect, whether there are logical groupings (e.g. a private network, an environment) — until you have enough to draft a diagram. Don't ask everything at once.
3. Once you have enough information, respond with a single fenced \`\`\`d2 code block containing valid, ready-to-paste D2 source — shapes, containers, connections, and \`icon: scw:<name>\` references only. Don't include theme, color, or layout settings (\`theme-id\`, \`layout-engine\`, etc.) — the editor applies those separately, and including them would just get overwritten.
4. After giving me the code, briefly explain any judgment calls you made (e.g. an icon you omitted because nothing matched, or a grouping you inferred).

Note: the \`icon: scw:<name>\` shorthand only resolves inside the Scaleway D2 Diagram Editor itself — it won't render on https://play.d2lang.com or elsewhere.`
