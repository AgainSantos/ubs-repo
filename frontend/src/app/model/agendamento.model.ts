import { Paciente } from './paciente.model';
import { Medico } from './medico.model';
import { TipoSemantico } from '../acessibilidade/paletas';

export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  REALIZADO = 'REALIZADO',
  FALTOU = 'FALTOU'
}

export interface StatusVisual {
  /** Significado do status; define a cor pela paleta de acessibilidade. */
  tipo: TipoSemantico;
  /** Ícone do Material Icons, para o status não depender só da cor. */
  icone: string;
  rotulo: string;
}

/**
 * Mapa status -> aparência. Substitui o antigo switch de getStatusColor():
 * cada status aponta para um significado (cor), um ícone e um rótulo.
 */
export const STATUS_VISUAL: ReadonlyMap<StatusAgendamento, StatusVisual> = new Map([
  [StatusAgendamento.AGENDADO, { tipo: 'info', icone: 'schedule', rotulo: 'Agendado' }],
  [StatusAgendamento.CONFIRMADO, { tipo: 'sucesso', icone: 'check_circle', rotulo: 'Confirmado' }],
  [StatusAgendamento.CANCELADO, { tipo: 'erro', icone: 'cancel', rotulo: 'Cancelado' }],
  [StatusAgendamento.REALIZADO, { tipo: 'neutro', icone: 'task_alt', rotulo: 'Realizado' }],
  [StatusAgendamento.FALTOU, { tipo: 'aviso', icone: 'person_off', rotulo: 'Faltou' }],
] as [StatusAgendamento, StatusVisual][]);

export interface Agendamento {
  id: number;
  paciente: Paciente;
  medico: Medico;
  dataHoraConsulta: string;
  status: StatusAgendamento;
  tipoConsulta: string;
  /** false quando a hora foi deixada em branco no cadastro. Vem do backend. */
  horarioDefinido?: boolean;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgendamentoRequest {
  pacienteId: number;
  medicoId: number;
  dataHoraConsulta: string;
  tipoConsulta: string;
  observacoes?: string;
}

export const TIPOS_CONSULTA = [
  'Consulta Cardiologia',
  'Consulta Dermatologia',
  'Consulta Endocrinologia',
  'Consulta Gastroenterologia',
  'Consulta Ginecologia',
  'Consulta Neurologia',
  'Consulta Oftalmologia',
  'Consulta Ortopedia',
  'Consulta Pediatria',
  'Consulta Psiquiatria',
  'Consulta Clínica Geral',
  'Exame de Rotina',
  'Consulta de Retorno'
];