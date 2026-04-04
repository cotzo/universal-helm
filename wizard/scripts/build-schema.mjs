#!/usr/bin/env node
/**
 * Produces a clean values.schema.json for the published Helm chart.
 *
 * Transformations:
 * 1. Remove properties where x-wizard.ui === true (and clean up required arrays)
 * 2. Remove all x-wizard and x-wizard-field metadata
 * 3. Remove empty properties objects left behind
 *
 * Usage: node wizard/scripts/build-schema.mjs [input] [output]
 *   Defaults: values.schema.json → values.schema.clean.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')

const inputPath = process.argv[2] || resolve(root, 'values.schema.json')
const outputPath = process.argv[3] || resolve(root, 'values.schema.clean.json')

const schema = JSON.parse(readFileSync(inputPath, 'utf8'))

function walk(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return

  // First pass: remove ui-only properties BEFORE stripping x-wizard
  // (we need x-wizard.ui to identify them)
  if (obj.properties) {
    for (const [key, prop] of Object.entries(obj.properties)) {
      if (prop?.['x-wizard']?.ui) {
        delete obj.properties[key]
        if (Array.isArray(obj.required)) {
          obj.required = obj.required.filter(r => r !== key)
          if (obj.required.length === 0) delete obj.required
        }
      }
    }
  }

  // Remove x-wizard and x-wizard-field from this object
  delete obj['x-wizard']
  delete obj['x-wizard-field']

  // Recurse into all values
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach(item => walk(item))
      } else {
        walk(value)
      }
    }
  }

  // Clean up empty properties
  if (obj.properties && Object.keys(obj.properties).length === 0) {
    delete obj.properties
  }
}

walk(schema)

writeFileSync(outputPath, JSON.stringify(schema, null, 2) + '\n')

const inputSize = readFileSync(inputPath, 'utf8').split('\n').length
const outputSize = JSON.stringify(schema, null, 2).split('\n').length
console.log(`Schema cleaned: ${inputPath}`)
console.log(`  Input:  ${inputSize} lines`)
console.log(`  Output: ${outputSize} lines (${Math.round((1 - outputSize / inputSize) * 100)}% reduction)`)
console.log(`  Written to: ${outputPath}`)
