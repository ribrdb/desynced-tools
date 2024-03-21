# desynced-tools
Tools for working with behaviors and blueprints from Desynced.

# Getting started

Try online at https://desynced-behavior-editor.web.app/ or for command line tools:

`npm install -g desynced-tools`

# Tools

## ds-disas
Usage: `ds-disas filename.txt`

Converts a Desynced blueprint or behavior string to assembly language.
The output filename will be the input with ".asm" added.
To produce the input file, copy a behavior or blueprint in the game and then paste that into a plain text file.

## ds-as
Usage: `ds-as filename.asm`

Convert from assembly language back into a Desynced clipboard string.
The output filename will be the input with ".txt" added.

## js2ds
Usage: `js2ds filename.js` or `js2ds filename.ts`

Convert from JavaScript or TypeScript to desynced-tools assembly language.
The output filename will be the input with ".asm" added.


# Development

Checkout out the code from https://github.com/ribrdb/desynced-tools

First run `npm install` to install dependencies, then run `npm run generate` to generate required code.

## Web demo
To build the web demo:
 - `npm run esbuild`
 - Extract the monaco 0.45.0 distribution into website/monaco-editor-0.45.0/
   https://registry.npmjs.org/monaco-editor/-/monaco-editor-0.45.0.tgz
