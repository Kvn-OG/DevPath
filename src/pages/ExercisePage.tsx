import { Link, useParams } from 'react-router-dom';
import { getExercise, lessonExercises, lessonOfExercise } from '../content';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { Card, PageHeader } from '../components/ui/primitives';
import NotFoundPage from './NotFoundPage';

export default function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  // Questões de avaliação, desafios e projetos têm páginas próprias.
  if (!exercise || !lessonExercises.includes(exercise)) return <NotFoundPage />;
  const lesson = lessonOfExercise(exercise.id);
  const index = lessonExercises.indexOf(exercise);
  const next = lessonExercises[index + 1];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link to="/exercicios" className="hover:text-fg">
            Exercícios
          </Link>
        }
        title={exercise.title}
        description={
          lesson && (
            <>
              Da aula{' '}
              <Link to={`/aulas/${lesson.id}`} className="text-accent-strong hover:underline">
                {lesson.title}
              </Link>
              . Precisa relembrar o conceito? A aula continua disponível.
            </>
          )
        }
      />
      <Card>
        <ExerciseRunner key={exercise.id} exercise={exercise} source="pratica" header={<span className="sr-only">{exercise.title}</span>} />
      </Card>
      {next && (
        <div className="text-right text-sm">
          <Link to={`/exercicios/${next.id}`} className="text-accent-strong hover:underline">
            Próximo exercício: {next.title} →
          </Link>
        </div>
      )}
    </div>
  );
}
