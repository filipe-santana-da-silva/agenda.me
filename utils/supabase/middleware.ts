// Thin compatibility shim. The real implementation lives in updateSession.ts
// to avoid accidental corruption during iterative edits. Export the same
// updateSession function so other modules importing this path continue to work.
export { updateSession } from './updateSession'