import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { ModoVisao, PALETAS, Paleta, corDoTexto } from './paletas';

/**
 * Aplica o modo de visão escolhido no site inteiro.
 *
 * Funcionamento: busca a paleta do modo no Mapa PALETAS e grava cada cor como
 * variável CSS na raiz do documento (--ubs-sucesso, --ubs-erro...). Os estilos
 * do sistema usam essas variáveis, então tudo muda de uma vez, sem recarregar.
 */
@Injectable({ providedIn: 'root' })
export class AcessibilidadeService {
  static readonly CHAVE_ARMAZENAMENTO = 'ubs.modoVisao';

  private readonly documento = inject(DOCUMENT);
  private readonly _modoAtual = signal<ModoVisao>('padrao');
  readonly modoAtual = this._modoAtual.asReadonly();

  constructor() {
    this.aplicar(this.lerModoSalvo(), false);
  }

  /** Lista de opções para o painel, na ordem em que foram inseridas no Mapa. */
  opcoes(): { modo: ModoVisao; paleta: Paleta }[] {
    return Array.from(PALETAS, ([modo, paleta]) => ({ modo, paleta }));
  }

  aplicar(modo: ModoVisao, salvar = true): void {
    const paleta = PALETAS.get(modo);
    if (!paleta) {
      return;
    }

    const raiz = this.documento.documentElement;
    for (const [tipo, cor] of Object.entries(paleta.cores)) {
      raiz.style.setProperty(`--ubs-${tipo}`, cor);
      raiz.style.setProperty(`--ubs-${tipo}-texto`, corDoTexto(cor));
    }
    raiz.dataset['modoVisao'] = modo;
    raiz.classList.toggle('modo-acessivel', modo !== 'padrao');

    this._modoAtual.set(modo);
    if (salvar) {
      this.salvar(modo);
    }
  }

  private lerModoSalvo(): ModoVisao {
    try {
      const salvo = localStorage.getItem(AcessibilidadeService.CHAVE_ARMAZENAMENTO);
      // has() descarta valores antigos ou alterados à mão no navegador.
      if (salvo && PALETAS.has(salvo as ModoVisao)) {
        return salvo as ModoVisao;
      }
    } catch {
      // Navegação privada ou armazenamento bloqueado: segue com o padrão.
    }
    return 'padrao';
  }

  private salvar(modo: ModoVisao): void {
    try {
      localStorage.setItem(AcessibilidadeService.CHAVE_ARMAZENAMENTO, modo);
    } catch {
      // Sem armazenamento, o modo vale só até recarregar a página.
    }
  }
}
