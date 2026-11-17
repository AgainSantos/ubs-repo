/**
 * Paletas de cores para pessoas com daltonismo.
 *
 * ESTRUTURA DE DADOS: Mapa (Map).
 *  - A chave é o modo de visão escolhido pelo usuário ('protanopia', etc.).
 *  - O valor é a paleta com as cores de cada significado (sucesso, erro...).
 *
 * Por que Mapa:
 *  - A busca da paleta pelo modo é direta pela chave (O(1)), sem percorrer lista.
 *  - Cada modo só pode existir uma vez (chaves únicas).
 *  - `has()` permite validar o valor salvo no navegador antes de usá-lo.
 *  - O Map preserva a ordem de inserção, que é a ordem exibida no painel.
 *  - Um modo novo entra com uma linha, sem mexer em if/else ou switch.
 *
 * As cores foram escolhidas a partir da paleta de Okabe & Ito (Color Universal
 * Design) e validadas com a simulação de Machado, Oliveira & Fernandes (2009).
 */

export type ModoVisao = 'padrao' | 'protanopia' | 'deuteranopia' | 'tritanopia';

/** Significados que a interface comunica por cor. */
export type TipoSemantico = 'sucesso' | 'erro' | 'aviso' | 'info' | 'neutro';

export interface Paleta {
  nome: string;
  descricao: string;
  cores: Record<TipoSemantico, string>;
}

const NEUTRO = '#6c757d';

export const PALETAS: ReadonlyMap<ModoVisao, Paleta> = new Map<ModoVisao, Paleta>([
  ['padrao', {
    nome: 'Padrão',
    descricao: 'Cores originais do sistema',
    cores: { sucesso: '#198754', erro: '#dc3545', aviso: '#ffc107', info: '#0d6efd', neutro: NEUTRO },
  }],
  ['protanopia', {
    nome: 'Protanopia',
    descricao: 'Dificuldade em ver o vermelho',
    cores: { sucesso: '#0072B2', erro: '#A63D00', aviso: '#F0E442', info: '#88CCF1', neutro: NEUTRO },
  }],
  ['deuteranopia', {
    nome: 'Deuteranopia',
    descricao: 'Dificuldade em ver o verde',
    cores: { sucesso: '#0072B2', erro: '#B35000', aviso: '#F0E442', info: '#88CCF1', neutro: NEUTRO },
  }],
  ['tritanopia', {
    nome: 'Tritanopia',
    descricao: 'Dificuldade com azul e amarelo',
    cores: { sucesso: '#00796B', erro: '#C2185B', aviso: '#FFB000', info: '#4A148C', neutro: NEUTRO },
  }],
]);

export interface SinalVisual {
  /** Nome do ícone do Material Icons. */
  icone: string;
  /** Símbolo em texto, para lugares onde não cabe um ícone (ex.: SnackBar). */
  simbolo: string;
  rotulo: string;
}

/**
 * Segundo Mapa: significado -> ícone e símbolo.
 * Garante que a informação nunca dependa só da cor (WCAG 2.x, critério 1.4.1).
 */
export const SINAIS: ReadonlyMap<TipoSemantico, SinalVisual> = new Map<TipoSemantico, SinalVisual>([
  ['sucesso', { icone: 'check_circle', simbolo: '✔', rotulo: 'Sucesso' }],
  ['erro', { icone: 'cancel', simbolo: '✖', rotulo: 'Erro' }],
  ['aviso', { icone: 'warning', simbolo: '⚠', rotulo: 'Aviso' }],
  ['info', { icone: 'info', simbolo: 'ℹ', rotulo: 'Informação' }],
  ['neutro', { icone: 'radio_button_unchecked', simbolo: '•', rotulo: 'Neutro' }],
]);

// =============================================================================
// CONTRASTE DO TEXTO
// Usa duas referências, cada uma no papel que tem hoje:
//  - WCAG 2.2 (W3C Recommendation, base da ABNT NBR 17225:2025): critério 1.4.3,
//    contraste mínimo 4,5:1 no nível AA. É a exigência normativa.
//  - APCA (Accessible Perceptual Contrast Algorithm), método candidato do
//    WCAG 3 (ainda rascunho). Mede o contraste como o olho percebe e corrige um
//    defeito da fórmula do WCAG 2, que superestima texto preto sobre cores
//    médias e saturadas (o verde, vermelho e azul do Bootstrap).
// =============================================================================

/** WCAG 2.2, critério 1.4.3 (nível AA), texto normal. */
export const CONTRASTE_MINIMO_WCAG = 4.5;

const TEXTO_CLARO = '#ffffff';
const TEXTO_ESCURO = '#1a1a1a';

function canais(hex: string): number[] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16) / 255);
}

/** Razão de contraste do WCAG 2.2 (de 1:1 a 21:1). */
export function contrasteWcag(textoHex: string, fundoHex: string): number {
  const luminancia = (hex: string) => {
    const [r, g, b] = canais(hex).map((c) =>
      c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [maior, menor] = [luminancia(textoHex), luminancia(fundoHex)].sort((a, b) => b - a);
  return (maior + 0.05) / (menor + 0.05);
}

/**
 * Contraste APCA (versão 0.0.98G-4g), em Lc. Vai de cerca de -108 a +106:
 * positivo é texto escuro em fundo claro, negativo é texto claro em fundo
 * escuro. Quanto maior o valor absoluto, mais legível. Referência de uso:
 * Lc 75 para texto corrido, Lc 60 para texto curto e Lc 45 para títulos.
 */
export function contrasteApca(textoHex: string, fundoHex: string): number {
  const luminanciaApca = (hex: string) => {
    const [r, g, b] = canais(hex).map((c) => Math.pow(c, 2.4));
    const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
    return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y; // ajuste para pretos
  };
  const yTexto = luminanciaApca(textoHex);
  const yFundo = luminanciaApca(fundoHex);
  if (Math.abs(yFundo - yTexto) < 0.0005) {
    return 0;
  }

  let lc: number;
  if (yFundo > yTexto) {
    const sapc = (Math.pow(yFundo, 0.56) - Math.pow(yTexto, 0.57)) * 1.14;
    lc = sapc < 0.1 ? 0 : sapc - 0.027;
  } else {
    const sapc = (Math.pow(yFundo, 0.65) - Math.pow(yTexto, 0.62)) * 1.14;
    lc = sapc > -0.1 ? 0 : sapc + 0.027;
  }
  return lc * 100;
}

/**
 * Escolhe texto claro ou escuro sobre uma cor de fundo:
 *  1. só aceita opções que cumprem o WCAG 2.2 AA (4,5:1);
 *  2. entre elas, fica com a de maior contraste percebido pelo APCA.
 */
export function corDoTexto(fundoHex: string): string {
  const opcoes = [TEXTO_CLARO, TEXTO_ESCURO];
  const aprovadas = opcoes.filter((t) => contrasteWcag(t, fundoHex) >= CONTRASTE_MINIMO_WCAG);
  const candidatas = aprovadas.length > 0 ? aprovadas : opcoes;
  return candidatas.reduce((melhor, t) =>
    Math.abs(contrasteApca(t, fundoHex)) > Math.abs(contrasteApca(melhor, fundoHex)) ? t : melhor,
  );
}
