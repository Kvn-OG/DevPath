// Teste de ponta a ponta do fluxo vertical do MVP:
// o estudante abre uma aula, resolve os exercícios, recebe feedback,
// a aula é concluída, o progresso é salvo e restaurado.

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from './App';
import { getExercise } from './content';
import { shuffledStepIds } from './domain/grading';
import { LOCAL_KEY } from './persistence/localRepository';
import { AuthProvider } from './state/AuthProvider';
import { MODE_KEY, ProgressProvider } from './state/ProgressProvider';
import type { OrderStepsExercise } from './types/content';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const FIND = { timeout: 5000 };

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe('dashboard', () => {
  it('não mostra estatísticas inventadas para um estudante novo', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Bem-vindo ao DevPath' }, FIND)).toBeInTheDocument();
    expect(screen.getByText('sem tentativas ainda')).toBeInTheDocument();
    expect(screen.getByText('0/24')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma revisão pendente')).toBeInTheDocument();
  });

  it('identifica claramente o modo demonstração', async () => {
    window.localStorage.setItem(MODE_KEY, 'demo');
    renderAt('/');
    expect(await screen.findByText(/todo o progresso exibido é fictício/i, {}, FIND)).toBeInTheDocument();
    expect(screen.getByText(/Olá, Estudante de demonstração/)).toBeInTheDocument();
  });
});

describe('fluxo de aprendizagem da aula 1', () => {
  it('resolve os exercícios, conclui a aula e restaura o progresso', async () => {
    const user = userEvent.setup();
    const view = renderAt('/aulas/logica-01');

    expect(await screen.findByRole('heading', { level: 1, name: /O que é programar/ }, FIND)).toBeInTheDocument();
    expect(await screen.findByText('Em andamento')).toBeInTheDocument();

    // Exercício guiado: ordenar etapas usando os botões de subir.
    const guided = screen.getByRole('article', { name: /Ordene o algoritmo da média escolar/ });
    const exercise = getExercise('ex-logica-01-guiado') as OrderStepsExercise;
    const order = shuffledStepIds(exercise);
    for (let target = 0; target < exercise.steps.length; target++) {
      const step = exercise.steps[target];
      let current = order.indexOf(step.id);
      while (current > target) {
        await user.click(within(guided).getByRole('button', { name: `Subir etapa: ${step.text}` }));
        [order[current - 1], order[current]] = [order[current], order[current - 1]];
        current--;
      }
    }
    await user.click(within(guided).getByRole('button', { name: 'Verificar resposta' }));
    expect(await within(guided).findByText('Resposta correta')).toBeInTheDocument();

    // Exercício independente: primeiro uma resposta errada, depois a certa.
    const independent = screen.getByRole('article', { name: /Entradas e saídas da comissão/ });
    await user.click(within(independent).getByLabelText(/Entrada: valor da comissão/));
    await user.click(within(independent).getByRole('button', { name: 'Verificar resposta' }));
    expect(within(independent).getByText('Ainda não está certo')).toBeInTheDocument();
    expect(within(independent).getByText(/Está invertido/)).toBeInTheDocument();

    await user.click(within(independent).getByRole('button', { name: /Tentar novamente/ }));
    await user.click(within(independent).getByLabelText(/Entradas: total vendido no mês e percentual/));
    await user.click(within(independent).getByRole('button', { name: 'Verificar resposta' }));
    expect(within(independent).getByText('Resposta correta')).toBeInTheDocument();

    expect(await screen.findByText('Aula concluída')).toBeInTheDocument();

    // Persistência: o progresso é salvo automaticamente…
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? '{}');
      expect(saved.lessons?.['logica-01']?.completedAt).toBeDefined();
      expect(saved.attempts).toHaveLength(3);
    });
    view.unmount();

    // …e restaurado em uma nova sessão.
    renderAt('/');
    expect(await screen.findByText('2/24', {}, FIND)).toBeInTheDocument();
    expect(screen.getByText('2 de 3 tentativas')).toBeInTheDocument();
  });

  it('libera dicas uma de cada vez e bloqueia a solução antes de tentar', async () => {
    const user = userEvent.setup();
    renderAt('/aulas/logica-01');
    const guided = await screen.findByRole('article', { name: /Ordene o algoritmo/ }, FIND);

    expect(within(guided).getByText(/A solução é liberada depois de uma tentativa/)).toBeInTheDocument();
    await user.click(within(guided).getByRole('button', { name: /Mostrar dica 1/ }));
    expect(within(guided).getByText('Dica 1 — conceito')).toBeInTheDocument();
    expect(within(guided).queryByText('Dica 2 — raciocínio')).not.toBeInTheDocument();
    await user.click(within(guided).getByRole('button', { name: /Mostrar dica 2/ }));
    expect(within(guided).getByText('Dica 2 — raciocínio')).toBeInTheDocument();
  });

  it('respeita pré-requisitos, mas permite abrir para consulta', async () => {
    const user = userEvent.setup();
    renderAt('/aulas/logica-03');
    expect(await screen.findByText('Esta aula tem pré-requisitos pendentes', {}, FIND)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abrir mesmo assim' }));
    expect(screen.getByRole('heading', { name: 'O conceito' })).toBeInTheDocument();
  });
});

describe('navegação', () => {
  it.each([
    ['/trilhas', 'Trilhas de aprendizagem'],
    ['/exercicios', 'Ambiente de exercícios'],
    ['/desafios', 'Desafios práticos'],
    ['/projetos', 'Projetos'],
    ['/progresso', 'Progresso e estatísticas'],
    ['/revisao', 'Revisão de conteúdos'],
    ['/glossario', 'Glossário'],
    ['/configuracoes', 'Configurações'],
    ['/avaliacoes/logica-final', 'Avaliação final da trilha'],
    ['/desafios/desafio-calculadora', 'Calculadora'],
    ['/projetos/projeto-a-comissoes', 'Calculadora de comissões e metas'],
    ['/trilhas/logica-js/modulos/logica-m2', 'Decisões, repetições e funções'],
    ['/rota-inexistente', 'Página não encontrada'],
  ])('%s abre', async (path, title) => {
    renderAt(path);
    expect(await screen.findByText(title, { selector: 'h1, p' }, FIND)).toBeInTheDocument();
  });
});
