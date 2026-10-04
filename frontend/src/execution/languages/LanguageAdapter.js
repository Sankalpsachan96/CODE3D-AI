/**
 * CODE3D-AI - Base Language Adapter
 * 
 * Defines the contract that every language adapter must satisfy:
 * - language detection
 * - syntax validation
 * - execution & trace generation
 * - source mapping
 */

export class LanguageAdapter {
  constructor(name) {
    this.name = name;
  }

  detect(code) {
    throw new Error('detect() must be implemented by subclass');
  }

  validateSyntax(code) {
    throw new Error('validateSyntax() must be implemented by subclass');
  }

  execute(code, options = {}) {
    throw new Error('execute() must be implemented by subclass');
  }
}
