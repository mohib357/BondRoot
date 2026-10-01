# BondRoot

**BondRoot** is a family tree and relationship bond manager built with React, TypeScript, and Tailwind CSS. Rewritten from the initial Android starter, BondRoot brings family roots and kinship connections to life with interactive tree diagrams, person profiles, bidirectional relationship tracking, and a kinship calculator.

## Features

- **Generational Family Tree (Roots & Branches)**: Visual lineage graph grouping ancestors and descendants into generational tiers with zoom controls and root lineage filtering.
- **Person Management (CRUD)**: Create, view, edit, and delete family members with detailed profiles, birth/death records, occupations, biographies, and tags.
- **Bidirectional Kinship Bonds**: Real-time reciprocal relationship linking for parents (roots), children (descendants), spouses, and siblings.
- **Kinship Calculator (Relationship Finder)**: Automatically traverses bond connections using graph search to calculate exact relationships (e.g., Grandmother, First Cousin, Son-in-law) with step-by-step traversal paths.
- **Bond Matrix**: Bird's-eye view of all recorded marital, parental, and sibling connections.
- **Import & Export**: Backup complete family trees to JSON, restore pre-loaded multi-generational sample trees, or import existing genealogies.
- **Local Persistence**: Automatically synchronizes your family tree with browser storage.

## Development

```bash
npm install
npm run dev
```

Built for Node.js 22 and Vite on port 3000.
