# Random Sequence Generator

A web-based tool for generating random biological sequences, built with Next.js and React.

## Overview

This application allows users to generate and manipulate random nucleotide and amino acid sequences. It provides a user-friendly interface for:

- Selecting allowed characters (nucleotides, amino acids, and punctuation)
- Generating random sequences of specified length
- Editing sequences manually
- Filtering sequences to remove disallowed characters
- Viewing sequences in a customizable sequence viewer
- Copying sequences in plain text or FASTA format

## Directory Structure

```
nitro-bio-random/
├── app/                 # next.js app
├── components/
│   └── ui/              # Reusable UI components
├── hooks/               # Custom hooks
├── lib/                 # Utility functions
├── utils/
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `pnpm install`
3. Run the development server: `npm run dev` or `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
