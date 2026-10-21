// Trilha 11 — Servidores: VPS, Docker e EasyPanel.

import type { Concept } from '../../types/content';
import * as l01 from './lessons/01-o-que-e-vps';
import * as l02 from './lessons/02-ssh';
import * as l03 from './lessons/03-terminal-linux';
import * as l04 from './lessons/04-usuario-ssh-seguro';
import * as l05 from './lessons/05-firewall';
import * as l06 from './lessons/06-atualizacoes-fail2ban';
import * as l07 from './lessons/07-dns';
import * as l08 from './lessons/08-proxy-reverso';
import * as l09 from './lessons/09-https';
import * as l10 from './lessons/10-docker-basico';
import * as l11 from './lessons/11-dockerfile';
import * as l12 from './lessons/12-compose';
import * as l13 from './lessons/13-easypanel-instalacao';
import * as l14 from './lessons/14-easypanel-deploy';
import * as l15 from './lessons/15-easypanel-postgres';
import * as l16 from './lessons/16-backups';
import * as l17 from './lessons/17-monitoramento';
import * as l18 from './lessons/18-atualizacoes-custos';

export const infraLessonModules = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12, l13, l14, l15, l16, l17, l18];

export const infraConcepts: Concept[] = [
  { id: 'infra-vps', name: 'VPS e hospedagem', lessonId: 'infra-01' },
  { id: 'infra-ssh', name: 'SSH e chaves', lessonId: 'infra-02' },
  { id: 'infra-linux', name: 'Terminal Linux', lessonId: 'infra-03' },
  { id: 'infra-usuarios', name: 'Usuários e SSH seguro', lessonId: 'infra-04' },
  { id: 'infra-firewall', name: 'Firewall e portas', lessonId: 'infra-05' },
  { id: 'infra-atualizacoes', name: 'Atualizações e fail2ban', lessonId: 'infra-06' },
  { id: 'infra-dns', name: 'DNS', lessonId: 'infra-07' },
  { id: 'infra-proxy', name: 'Proxy reverso', lessonId: 'infra-08' },
  { id: 'infra-https', name: 'HTTPS e certificados', lessonId: 'infra-09' },
  { id: 'infra-docker', name: 'Imagens e containers', lessonId: 'infra-10' },
  { id: 'infra-dockerfile', name: 'Dockerfile', lessonId: 'infra-11' },
  { id: 'infra-compose', name: 'Volumes, redes e Compose', lessonId: 'infra-12' },
  { id: 'infra-easypanel', name: 'Instalação do EasyPanel', lessonId: 'infra-13' },
  { id: 'infra-deploy', name: 'Deploy no EasyPanel', lessonId: 'infra-14' },
  { id: 'infra-easypanel-postgres', name: 'PostgreSQL no EasyPanel', lessonId: 'infra-15' },
  { id: 'infra-backup', name: 'Backups e restauração', lessonId: 'infra-16' },
  { id: 'infra-monitoramento', name: 'Monitoramento', lessonId: 'infra-17' },
  { id: 'infra-operacao', name: 'Atualizações e rollback', lessonId: 'infra-18' },
];
