// utils/formula-engine.ts
import { DSFConfig } from "../services/dsf-config.service";

export interface FormulaContext {
  [key: string]: number | string;
}

export interface FormulaResult {
  value: number;
  error?: string;
}

/**
 * Simple formula engine for DSF config operations
 * Supports basic arithmetic operations and references to other fields
 */
export class FormulaEngine {
  /**
   * Evaluate a formula operation with given context
   */
  static evaluate(operation: string, context: FormulaContext = {}): FormulaResult {
    try {
      if (!operation || typeof operation !== 'string') {
        return { value: 0, error: 'Invalid operation' };
      }

      // Clean the operation string
      let formula = operation.trim();

      // Replace field references with values from context
      // Support patterns like [field_name], {field_name}, or field_name
      formula = formula.replace(/\[([^\]]+)\]/g, (match, fieldName) => {
        const value = context[fieldName];
        return typeof value === 'number' ? value.toString() : '0';
      });

      formula = formula.replace(/\{([^\}]+)\}/g, (match, fieldName) => {
        const value = context[fieldName];
        return typeof value === 'number' ? value.toString() : '0';
      });

      // Replace simple field names (assuming they don't conflict with operators)
      Object.keys(context).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        formula = formula.replace(regex, context[key]?.toString() || '0');
      });

      // Evaluate the formula safely
      const result = this.safeEval(formula);

      if (typeof result === 'number' && !isNaN(result)) {
        return { value: result };
      } else {
        return { value: 0, error: 'Invalid result' };
      }
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return { value: 0, error: error instanceof Error ? error.message : 'Evaluation failed' };
    }
  }

  /**
   * Safely evaluate a mathematical expression
   */
  private static safeEval(expression: string): number {
    // Remove dangerous keywords
    const dangerous = ['eval', 'Function', 'constructor', 'prototype', '__proto__', 'this', 'window', 'document', 'global'];
    for (const word of dangerous) {
      if (expression.includes(word)) {
        throw new Error(`Dangerous keyword: ${word}`);
      }
    }

    // Only allow safe mathematical operations
    const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');

    try {
      // Use Function constructor for safer evaluation (still not perfect but better than eval)
      return new Function('return ' + safeExpression)();
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  }

  /**
   * Evaluate all operations in a DSF config
   */
  static evaluateConfig(config: DSFConfig, context: FormulaContext = {}): { [key: string]: FormulaResult } {
    const results: { [key: string]: FormulaResult } = {};

    if (config.operations && Array.isArray(config.operations)) {
      config.operations.forEach((operation, index) => {
        const result = this.evaluate(operation, context);
        results[`op_${index}`] = result;
      });
    }

    return results;
  }

  /**
   * Get field value from context or calculate from formula
   */
  static getFieldValue(fieldName: string, configs: DSFConfig[], context: FormulaContext = {}): number {
    // First check if field exists in context
    if (context[fieldName] !== undefined) {
      return typeof context[fieldName] === 'number' ? context[fieldName] as number : 0;
    }

    // Look for a config that matches this field and has operations
    const relevantConfig = configs.find(config =>
      config.codeDsf.toLowerCase().includes(fieldName.toLowerCase()) ||
      config.libelle.toLowerCase().includes(fieldName.toLowerCase())
    );

    if (relevantConfig && relevantConfig.operations && relevantConfig.operations.length > 0) {
      const result = this.evaluate(relevantConfig.operations[0], context);
      return result.error ? 0 : result.value;
    }

    return 0;
  }
}