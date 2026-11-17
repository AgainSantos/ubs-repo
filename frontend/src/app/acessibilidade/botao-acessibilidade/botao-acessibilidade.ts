import { Component, ElementRef, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AcessibilidadeService } from '../acessibilidade.service';
import { ModoVisao, PALETAS, SINAIS, TipoSemantico, corDoTexto } from '../paletas';

/**
 * Botão flutuante de acessibilidade. Abre um painel em que cada modo de visão
 * mostra três esferas (sucesso, erro e aviso) com as cores daquele modo.
 */
@Component({
  selector: 'app-botao-acessibilidade',
  templateUrl: './botao-acessibilidade.html',
  styleUrl: './botao-acessibilidade.scss',
  host: { '(document:click)': 'fecharSeCliqueFora($event)' },
})
export class BotaoAcessibilidade {
  protected readonly servico = inject(AcessibilidadeService);
  private readonly anunciador = inject(LiveAnnouncer);
  private readonly elemento = inject(ElementRef<HTMLElement>);

  protected readonly aberto = signal(false);
  protected readonly opcoes = this.servico.opcoes();
  protected readonly tiposNaEsfera: TipoSemantico[] = ['sucesso', 'erro', 'aviso'];

  protected icone(tipo: TipoSemantico): string {
    return SINAIS.get(tipo)?.icone ?? '';
  }

  protected corTexto(fundo: string): string {
    return corDoTexto(fundo);
  }

  protected alternar(): void {
    this.aberto.update((v) => !v);
  }

  protected fechar(): void {
    this.aberto.set(false);
  }

  protected escolher(modo: ModoVisao): void {
    this.servico.aplicar(modo);
    this.anunciador.announce(`Modo de cores ${PALETAS.get(modo)?.nome} ativado`);
  }

  protected fecharSeCliqueFora(evento: MouseEvent): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.fechar();
    }
  }
}
