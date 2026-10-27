export const meta = {
  name: 'skeptic-research',
  description: 'Research batch: independent angles in parallel, then an advisor synthesis saved to a file',
  whenToUse: 'Invoked by the skeptic-research skill with args { context, angles[], output, language, roles, models? }',
  phases: [
    { title: 'Research', detail: 'one agent per angle' },
    { title: 'Synthesis', detail: 'advisor plan saved to a file' },
  ],
}

const CONTEXT = args.context
const ANGLES = args.angles
const OUTPUT = args.output
const LANG = args.language || 'English'
const ROLES = args.roles || {}
const MODELS = { research: 'sonnet', advise: 'opus', ...(args.models || {}) }
const role = (name) => (ROLES[name] ? `${ROLES[name]}\n\n---\n\n` : '')

phase('Research')
const findings = await parallel(ANGLES.map((a) => () =>
  agent(`${role('researcher')}${CONTEXT}\n\nAngle: ${a.prompt}\n\nReply in ${LANG}.`, { label: `research:${a.id}`, phase: 'Research', model: a.model || MODELS.research })
    .then((text) => ({ id: a.id, text }))))
const done = findings.filter(Boolean)
const missing = ANGLES.filter((a) => !done.some((d) => d.id === a.id)).map((a) => a.id)
if (missing.length) log(`No result for: ${missing.join(', ')}`)

phase('Synthesis')
const plan = await agent(
  `${role('advisor')}${CONTEXT}\n\nThe researchers returned:\n\n${done.map((f) => `### ${f.id}\n${f.text}`).join('\n\n')}\n\n` +
  `Write the plan in ${LANG} and save it to ${OUTPUT} (create the file; edit nothing else). Structure: (1) the 3 things to start this week, with the agent automation and the owner's minutes per week; (2) a ranked table of bets split into safe and risky, each with expected effect, evidence (URL) or "hypothesis", risk, and the 2-4 week test that decides whether to continue; (3) what to stop or not do, with reasons; (4) the patterns from real people most worth copying, with sources; (5) the metrics to watch weekly. Every number sourced or marked as hypothesis. Reply with a 15-line summary and the file path.`,
  { label: 'advisor', phase: 'Synthesis', model: MODELS.advise })

return { angles: done.map((f) => f.id), missing, plan }
