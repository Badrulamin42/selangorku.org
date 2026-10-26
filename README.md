# Selangorku.org UI Rebuild

A responsive Next.js recreation of [selangorku.org](https://selangorku.org/) with a redesigned interface while preserving the original project, LPHS and information links.

## Stack

- Next.js App Router + TypeScript
- shadcn/ui primitives with Radix UI
- Tailwind CSS
- Motion
- Lucide React

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Form integration

The DSR calculator uses the original Fluent Forms field names. `app/api/fluentform/route.ts` fetches a fresh nonce from the original site and forwards valid submissions to the original WordPress Fluent Forms endpoint. No submission was sent during implementation or QA.
