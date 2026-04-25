# ADR-002: Use Electron + React + TypeScript for phase 1

## Status
Accepted

## Decision
Use Electron for the shell, React for the UI, and TypeScript across the repo.

## Why
This is the pragmatic path for a Windows-first local tool that needs UI, filesystem access via a controlled bridge, and room for later packaging.

## Consequences
- renderer and Node contexts must stay separated
- preload API surface must stay small
- the first milestone is usefulness, not perfection
