import { z } from 'zod';

export const MuscleGroupSchema = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'full_body',
]);
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;

export const EquipmentSchema = z.enum([
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'bodyweight',
  'resistance_band',
  'pull_up_bar',
  'bench',
  'treadmill',
  'rower',
  'bike',
  'none',
]);
export type Equipment = z.infer<typeof EquipmentSchema>;

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullable(),
  instructions: z.string().max(5000).nullable(),
  video_url: z.string().url().nullable(),
  muscle_groups: z.array(MuscleGroupSchema).min(1),
  equipment: z.array(EquipmentSchema).min(1),
  difficulty: DifficultySchema,
  is_public: z.boolean(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const CreateExerciseSchema = ExerciseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
});

export const UpdateExerciseSchema = CreateExerciseSchema.partial();

export const ExerciseListQuerySchema = z.object({
  muscle_group: MuscleGroupSchema.optional(),
  equipment: EquipmentSchema.optional(),
  difficulty: DifficultySchema.optional(),
  is_public: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const ExerciseResponseSchema = z.object({
  data: ExerciseSchema,
  error: z.null(),
});

export const ExerciseListResponseSchema = z.object({
  data: z.array(ExerciseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  error: z.null(),
});
