/// <reference lib="webworker" />
// Web Worker que executa o código do estudante fora da thread da interface:
// sem acesso ao DOM, ao armazenamento da aplicação ou à rede.

import { evaluate } from './evaluator';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const send = scope.postMessage.bind(scope);

for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'BroadcastChannel']) {
  try {
    Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false });
  } catch {
    // Alguns ambientes não permitem redefinir; os nomes também são sombreados no avaliador.
  }
}

scope.onmessage = (event: MessageEvent) => {
  const { source, tests, constraints } = event.data;
  send(evaluate(source, tests, constraints));
};
