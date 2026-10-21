// Trilha 5 — Banco de dados e PostgreSQL.

import type { Concept } from '../../types/content';
import * as l01 from './lessons/01-o-que-e-banco-de-dados';
import * as l02 from './lessons/02-modelo-relacional';
import * as l03 from './lessons/03-transacoes-acid';
import * as l04 from './lessons/04-select-where';
import * as l05 from './lessons/05-order-by-limit';
import * as l06 from './lessons/06-null';
import * as l07 from './lessons/07-insert-update-delete';
import * as l08 from './lessons/08-chaves';
import * as l09 from './lessons/09-cardinalidade';
import * as l10 from './lessons/10-join';
import * as l11 from './lessons/11-left-join';
import * as l12 from './lessons/12-group-by';
import * as l13 from './lessons/13-having-subconsultas';
import * as l14 from './lessons/14-constraints';
import * as l15 from './lessons/15-normalizacao';
import * as l16 from './lessons/16-indices';
import * as l17 from './lessons/17-explain';
import * as l18 from './lessons/18-isolamento';
import * as l19 from './lessons/19-wal';
import * as l20 from './lessons/20-instalacao-psql';
import * as l21 from './lessons/21-permissoes';
import * as l22 from './lessons/22-tipos-postgres';
import * as l23 from './lessons/23-backup';
import * as l24 from './lessons/24-conexoes-extensoes';

export const bancoLessonModules = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12, l13, l14, l15, l16, l17, l18, l19, l20, l21, l22, l23, l24];

export const bancoConcepts: Concept[] = [
  { id: 'bd-sgbd', name: 'Bancos de dados e SGBDs', lessonId: 'banco-01' },
  { id: 'bd-modelo-relacional', name: 'Modelo relacional e tipos', lessonId: 'banco-02' },
  { id: 'bd-acid', name: 'Transações e ACID', lessonId: 'banco-03' },
  { id: 'bd-select', name: 'SELECT e WHERE', lessonId: 'banco-04' },
  { id: 'bd-ordenacao', name: 'Ordenação e paginação', lessonId: 'banco-05' },
  { id: 'bd-null', name: 'Valores nulos', lessonId: 'banco-06' },
  { id: 'bd-dml', name: 'INSERT, UPDATE e DELETE', lessonId: 'banco-07' },
  { id: 'bd-chaves', name: 'Chaves primárias e estrangeiras', lessonId: 'banco-08' },
  { id: 'bd-cardinalidade', name: 'Cardinalidade de relacionamentos', lessonId: 'banco-09' },
  { id: 'bd-join', name: 'JOIN', lessonId: 'banco-10' },
  { id: 'bd-left-join', name: 'LEFT JOIN e outras junções', lessonId: 'banco-11' },
  { id: 'bd-agregacao', name: 'Agregação e GROUP BY', lessonId: 'banco-12' },
  { id: 'bd-subconsultas', name: 'HAVING e subconsultas', lessonId: 'banco-13' },
  { id: 'bd-constraints', name: 'Constraints', lessonId: 'banco-14' },
  { id: 'bd-normalizacao', name: 'Normalização', lessonId: 'banco-15' },
  { id: 'bd-indices', name: 'Armazenamento e índices', lessonId: 'banco-16' },
  { id: 'bd-explain', name: 'Planos de execução', lessonId: 'banco-17' },
  { id: 'bd-isolamento', name: 'Concorrência e isolamento', lessonId: 'banco-18' },
  { id: 'bd-wal', name: 'WAL e recuperação', lessonId: 'banco-19' },
  { id: 'pg-psql', name: 'Instalação e psql', lessonId: 'banco-20' },
  { id: 'pg-permissoes', name: 'Schemas, roles e permissões', lessonId: 'banco-21' },
  { id: 'pg-tipos', name: 'Tipos do PostgreSQL', lessonId: 'banco-22' },
  { id: 'pg-backup', name: 'Backup e restauração', lessonId: 'banco-23' },
  { id: 'pg-conexoes', name: 'Conexões, pooling e extensões', lessonId: 'banco-24' },
];
