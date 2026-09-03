import { sumBySide, sumMovement } from './account-sum.util';

/**
 * Petit interpréteur pour le mini-DSL utilisé dans la colonne "AD" de la
 * table OHADA pour le Tableau des Flux de Trésorerie (et quelques lignes
 * isolées ailleurs). Grammaire (EBNF):
 *
 *   expr      := ifExpr | addExpr
 *   ifExpr    := "SI" addExpr ">" addExpr "ALORS" addExpr "SINON" addExpr
 *   addExpr   := term (("+" | "-") term)*
 *   term      := "-" term | funcCall | number | "(" addExpr ")"
 *   funcCall  := ("SD"|"SC"|"SDA"|"SCA"|"MD"|"MC") "(" accountList ")"
 *   accountList := account (";" account)* ("SAUF" account (";" account)*)?
 *
 * SD/SC = solde débiteur/créditeur sur la balance courante (N).
 * SDA/SCA = idem sur la balance N-1 ("Antérieure").
 * MD/MC = mouvement débit/crédit de la période (N).
 * SAUF exclut les comptes listés après lui du reste de la liste.
 */

type TokenType =
  | 'IDENT'
  | 'NUMBER'
  | 'LPAREN'
  | 'RPAREN'
  | 'SEMI'
  | 'PLUS'
  | 'MINUS'
  | 'GT'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '(') {
      tokens.push({ type: 'LPAREN', value: c });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'RPAREN', value: c });
      i++;
      continue;
    }
    if (c === ';') {
      tokens.push({ type: 'SEMI', value: c });
      i++;
      continue;
    }
    if (c === '+') {
      tokens.push({ type: 'PLUS', value: c });
      i++;
      continue;
    }
    if (c === '-') {
      tokens.push({ type: 'MINUS', value: c });
      i++;
      continue;
    }
    if (c === '>') {
      tokens.push({ type: 'GT', value: c });
      i++;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < input.length && /[0-9.]/.test(input[j])) j++;
      tokens.push({ type: 'NUMBER', value: input.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-zÀ-ÿ]/.test(c)) {
      let j = i;
      while (j < input.length && /[A-Za-zÀ-ÿ]/.test(input[j])) j++;
      tokens.push({ type: 'IDENT', value: input.slice(i, j).toUpperCase() });
      i = j;
      continue;
    }
    // Unknown character (accents, stray punctuation): skip.
    i++;
  }
  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

export type FormulaFn = 'SD' | 'SC' | 'SDA' | 'SCA' | 'MD' | 'MC';

export type FormulaNode =
  | { kind: 'call'; fn: FormulaFn; accounts: string[]; exclude: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'binary'; op: '+' | '-'; left: FormulaNode; right: FormulaNode }
  | { kind: 'unaryMinus'; operand: FormulaNode }
  | {
      kind: 'if';
      left: FormulaNode;
      right: FormulaNode;
      then: FormulaNode;
      else: FormulaNode;
    };

const FUNCTION_NAMES: FormulaFn[] = ['SD', 'SC', 'SDA', 'SCA', 'MD', 'MC'];

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const t = this.next();
    if (t.type !== type) {
      throw new Error(
        `[formula-engine] Attendu ${type}, obtenu ${t.type} ("${t.value}")`
      );
    }
    return t;
  }

  parse(): FormulaNode {
    const node = this.parseExpr();
    this.expect('EOF');
    return node;
  }

  private parseExpr(): FormulaNode {
    if (this.peek().type === 'IDENT' && this.peek().value === 'SI') {
      return this.parseIf();
    }
    return this.parseAdd();
  }

  private parseIf(): FormulaNode {
    this.expect('IDENT'); // SI
    const left = this.parseAdd();
    this.expect('GT');
    const right = this.parseAdd();
    this.expectKeyword('ALORS');
    const thenBranch = this.parseAdd();
    this.expectKeyword('SINON');
    const elseBranch = this.parseAdd();
    return { kind: 'if', left, right, then: thenBranch, else: elseBranch };
  }

  private expectKeyword(keyword: string): void {
    const t = this.next();
    if (t.type !== 'IDENT' || t.value !== keyword) {
      throw new Error(
        `[formula-engine] Attendu mot-clé "${keyword}", obtenu "${t.value}"`
      );
    }
  }

  private parseAdd(): FormulaNode {
    let node = this.parseTerm();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.next().type === 'PLUS' ? '+' : '-';
      const right = this.parseTerm();
      node = { kind: 'binary', op, left: node, right };
    }
    return node;
  }

  private parseTerm(): FormulaNode {
    if (this.peek().type === 'MINUS') {
      this.next();
      return { kind: 'unaryMinus', operand: this.parseTerm() };
    }
    if (this.peek().type === 'LPAREN') {
      this.next();
      const node = this.parseAdd();
      this.expect('RPAREN');
      return node;
    }
    if (this.peek().type === 'NUMBER') {
      const t = this.next();
      return { kind: 'number', value: parseFloat(t.value) };
    }
    if (
      this.peek().type === 'IDENT' &&
      FUNCTION_NAMES.includes(this.peek().value as FormulaFn)
    ) {
      const fn = this.next().value as FormulaFn;
      this.expect('LPAREN');
      const { accounts, exclude } = this.parseAccountList();
      this.expect('RPAREN');
      return { kind: 'call', fn, accounts, exclude };
    }
    throw new Error(
      `[formula-engine] Terme inattendu: "${this.peek().value}" (${this.peek().type})`
    );
  }

  private parseAccountList(): { accounts: string[]; exclude: string[] } {
    const accounts: string[] = [];
    const exclude: string[] = [];

    accounts.push(this.expectAccount());
    while (this.peek().type === 'SEMI') {
      this.next();
      if (this.peek().type === 'IDENT' && this.peek().value === 'SAUF') {
        break;
      }
      accounts.push(this.expectAccount());
    }

    if (this.peek().type === 'IDENT' && this.peek().value === 'SAUF') {
      this.next();
      exclude.push(this.expectAccount());
      while (this.peek().type === 'SEMI') {
        this.next();
        exclude.push(this.expectAccount());
      }
    }

    return { accounts, exclude };
  }

  private expectAccount(): string {
    // "SAUF" peut aussi apparaître collé à un compte sans point-virgule
    // (ex: "10 SAUF 109"): traité au niveau accountList via un lookahead
    // sur IDENT "SAUF" après le premier compte.
    const t = this.expect('NUMBER');
    return t.value;
  }
}

export function parseFormula(source: string): FormulaNode {
  const tokens = tokenize(source);
  return new Parser(tokens).parse();
}

export interface FormulaContext {
  currentRows: any[];
  priorRows: any[];
}

export function evaluateFormula(node: FormulaNode, ctx: FormulaContext): number {
  switch (node.kind) {
    case 'number':
      return node.value;
    case 'unaryMinus':
      return -evaluateFormula(node.operand, ctx);
    case 'binary': {
      const left = evaluateFormula(node.left, ctx);
      const right = evaluateFormula(node.right, ctx);
      return node.op === '+' ? left + right : left - right;
    }
    case 'if': {
      const left = evaluateFormula(node.left, ctx);
      const right = evaluateFormula(node.right, ctx);
      return left > right
        ? evaluateFormula(node.then, ctx)
        : evaluateFormula(node.else, ctx);
    }
    case 'call': {
      switch (node.fn) {
        case 'SD':
          return sumBySide(ctx.currentRows, node.accounts, 'SD', node.exclude);
        case 'SC':
          return sumBySide(ctx.currentRows, node.accounts, 'SC', node.exclude);
        case 'SDA':
          return sumBySide(ctx.priorRows, node.accounts, 'SD', node.exclude);
        case 'SCA':
          return sumBySide(ctx.priorRows, node.accounts, 'SC', node.exclude);
        case 'MD':
          return sumMovement(ctx.currentRows, node.accounts, 'MD', node.exclude);
        case 'MC':
          return sumMovement(ctx.currentRows, node.accounts, 'MC', node.exclude);
        default:
          return 0;
      }
    }
    default:
      return 0;
  }
}

export function evaluateFormulaSource(source: string, ctx: FormulaContext): number {
  return evaluateFormula(parseFormula(source), ctx);
}
