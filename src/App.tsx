import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { DashboardPage } from './pages/DashboardPage';
import { AuthProvider } from './state/AuthProvider';
import { ProgressProvider } from './state/ProgressProvider';

// Páginas com editor de código são carregadas sob demanda.
const TracksPage = lazy(() => import('./pages/TracksPage'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage'));
const ChallengePage = lazy(() => import('./pages/ChallengePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const ReviewSessionPage = lazy(() => import('./pages/ReviewSessionPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const page = (node: ReactNode) => <Suspense fallback={<p className="text-muted">Carregando…</p>}>{node}</Suspense>;

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="trilhas" element={page(<TracksPage />)} />
        <Route path="trilhas/:trackId" element={page(<TrackPage />)} />
        <Route path="trilhas/:trackId/modulos/:moduleId" element={page(<ModulePage />)} />
        <Route path="aulas/:lessonId" element={page(<LessonPage />)} />
        <Route path="exercicios" element={page(<ExercisesPage />)} />
        <Route path="exercicios/:exerciseId" element={page(<ExercisePage />)} />
        <Route path="desafios" element={page(<ChallengesPage />)} />
        <Route path="desafios/:challengeId" element={page(<ChallengePage />)} />
        <Route path="projetos" element={page(<ProjectsPage />)} />
        <Route path="projetos/:projectId" element={page(<ProjectPage />)} />
        <Route path="progresso" element={page(<ProgressPage />)} />
        <Route path="revisao" element={page(<ReviewPage />)} />
        <Route path="revisao/:conceptId" element={page(<ReviewSessionPage />)} />
        <Route path="avaliacoes/:assessmentId" element={page(<AssessmentPage />)} />
        <Route path="glossario" element={page(<GlossaryPage />)} />
        <Route path="configuracoes" element={page(<SettingsPage />)} />
        <Route path="*" element={page(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
