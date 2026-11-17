import { TestBed } from '@angular/core/testing';
import { AcessibilidadeService } from './acessibilidade.service';
import {
  CONTRASTE_MINIMO_WCAG, PALETAS, contrasteApca, contrasteWcag, corDoTexto,
} from './paletas';

describe('AcessibilidadeService', () => {
  const chave = AcessibilidadeService.CHAVE_ARMAZENAMENTO;
  const raiz = document.documentElement;

  function criarServico(): AcessibilidadeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(AcessibilidadeService);
  }

  beforeEach(() => localStorage.removeItem(chave));
  afterEach(() => localStorage.removeItem(chave));

  it('começa no modo padrão quando não há nada salvo', () => {
    const servico = criarServico();
    expect(servico.modoAtual()).toBe('padrao');
    expect(raiz.classList.contains('modo-acessivel')).toBeFalse();
  });

  it('aplica as cores do Mapa como variáveis CSS e salva a escolha', () => {
    const servico = criarServico();
    servico.aplicar('protanopia');

    const cores = PALETAS.get('protanopia')!.cores;
    expect(raiz.style.getPropertyValue('--ubs-sucesso')).toBe(cores.sucesso);
    expect(raiz.style.getPropertyValue('--ubs-erro')).toBe(cores.erro);
    expect(raiz.classList.contains('modo-acessivel')).toBeTrue();
    expect(localStorage.getItem(chave)).toBe('protanopia');
  });

  it('recupera o modo salvo ao abrir o sistema de novo', () => {
    localStorage.setItem(chave, 'tritanopia');
    expect(criarServico().modoAtual()).toBe('tritanopia');
  });

  it('ignora um valor salvo que não existe no Mapa', () => {
    localStorage.setItem(chave, 'modo-inventado');
    expect(criarServico().modoAtual()).toBe('padrao');
  });

  it('lista as opções na ordem do Mapa', () => {
    const modos = criarServico().opcoes().map((o) => o.modo);
    expect(modos).toEqual(['padrao', 'protanopia', 'deuteranopia', 'tritanopia']);
  });

  it('escolhe texto com contraste legível sobre cada cor', () => {
    expect(corDoTexto('#0072B2')).toBe('#ffffff'); // azul escuro -> texto branco
    expect(corDoTexto('#F0E442')).toBe('#1a1a1a'); // amarelo claro -> texto escuro
  });

  it('usa texto branco no verde, vermelho e azul originais do sistema', () => {
    expect(corDoTexto('#198754')).toBe('#ffffff');
    expect(corDoTexto('#dc3545')).toBe('#ffffff');
    expect(corDoTexto('#0d6efd')).toBe('#ffffff');
    expect(corDoTexto('#ffc107')).toBe('#1a1a1a'); // amarelo continua com preto
  });

  it('calcula o APCA igual à referência oficial (#888 sobre branco = Lc 63,1)', () => {
    expect(contrasteApca('#888888', '#ffffff')).toBeCloseTo(63.1, 0);
    expect(contrasteApca('#ffffff', '#000000')).toBeLessThan(-100); // texto claro: negativo
  });

  it('toda cor de toda paleta cumpre WCAG 2.2 AA e APCA Lc 60 com o texto escolhido', () => {
    for (const [modo, paleta] of PALETAS) {
      for (const [tipo, fundo] of Object.entries(paleta.cores)) {
        const texto = corDoTexto(fundo);
        const descricao = `${modo}/${tipo} (${fundo})`;
        expect(contrasteWcag(texto, fundo)).withContext(descricao).toBeGreaterThanOrEqual(CONTRASTE_MINIMO_WCAG);
        expect(Math.abs(contrasteApca(texto, fundo))).withContext(descricao).toBeGreaterThanOrEqual(60);
      }
    }
  });
});
