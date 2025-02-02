import { Prisma } from '@prisma/client';

export type ExerciseWithMuscleGroups = Prisma.ExerciseGetPayload<{
  include: {
    muscleGroups: true;
  };
}>;

export type WorkoutWithExercises = Prisma.WorkoutGetPayload<{
  include: {
    workoutExercises: {
      include: {
        exercise: {
          include: {
            muscleGroups: true;
          };
        };
      };
    };
    status: true;
    WorkoutStatusLog: true;
  };
}>;

export type MuscleGroup = Prisma.MuscleGroupGetPayload<object>;

export type WorkoutStatusLog = Prisma.WorkoutStatusLogGetPayload<object>;
