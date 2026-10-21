// Trilha 10 — Go (Golang).

import type { Concept } from '../../types/content';
import * as l01 from './lessons/01-primeiro-programa';
import * as l02 from './lessons/02-variaveis-tipos';
import * as l03 from './lessons/03-fluxo-funcoes';
import * as l04 from './lessons/04-slices';
import * as l05 from './lessons/05-maps-structs';
import * as l06 from './lessons/06-ponteiros-metodos';
import * as l07 from './lessons/07-interfaces';
import * as l08 from './lessons/08-erros';
import * as l09 from './lessons/09-defer-pacotes';
import * as l10 from './lessons/10-goroutines';
import * as l11 from './lessons/11-channels';
import * as l12 from './lessons/12-context';
import * as l13 from './lessons/13-http';
import * as l14 from './lessons/14-postgres';
import * as l15 from './lessons/15-testes-build';

export const golangLessonModules = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12, l13, l14, l15];

export const golangConcepts: Concept[] = [
  { id: 'go-basico', name: 'Programas e módulos em Go', lessonId: 'go-01' },
  { id: 'go-tipos', name: 'Variáveis e tipos em Go', lessonId: 'go-02' },
  { id: 'go-funcoes', name: 'Controle de fluxo e funções em Go', lessonId: 'go-03' },
  { id: 'go-slices', name: 'Slices', lessonId: 'go-04' },
  { id: 'go-maps-structs', name: 'Maps e structs', lessonId: 'go-05' },
  { id: 'go-ponteiros', name: 'Ponteiros e métodos', lessonId: 'go-06' },
  { id: 'go-interfaces', name: 'Interfaces', lessonId: 'go-07' },
  { id: 'go-erros', name: 'Erros em Go', lessonId: 'go-08' },
  { id: 'go-defer-pacotes', name: 'defer, panic e pacotes', lessonId: 'go-09' },
  { id: 'go-goroutines', name: 'Goroutines e sincronização', lessonId: 'go-10' },
  { id: 'go-channels', name: 'Channels e select', lessonId: 'go-11' },
  { id: 'go-context', name: 'context', lessonId: 'go-12' },
  { id: 'go-http', name: 'APIs HTTP em Go', lessonId: 'go-13' },
  { id: 'go-postgres', name: 'PostgreSQL em Go', lessonId: 'go-14' },
  { id: 'go-testes', name: 'Testes e build em Go', lessonId: 'go-15' },
];
