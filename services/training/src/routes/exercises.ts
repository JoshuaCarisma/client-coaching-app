import { Hono } from 'hono';
import { z } from 'zod';
import {
  ExerciseSchema,
  CreateExerciseSchema,
  UpdateExerciseSchema,
  ExerciseListQuerySchema,
} from '@bbc/schemas';
import { jwtMiddleware } from '@bbc/service-identity/middleware/jwt';
import { requireRole } from '@bbc/service-identity/middleware/roles';
import type { JwtVariables } from '@bbc/service-identity/middleware/jwt';
import { db } from '../db/client.js';

type Vars = JwtVariables;

const exercises = new Hono<{ Variables: Vars }>();

exercises.use('*', jwtMiddleware);

const uuidSchema = z.string().uuid();

exercises.get('/', async (c) => {
  const raw = c.req.query();
  const parsed = ExerciseListQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const { muscle_group, equipment, difficulty, is_public, search, limit, offset } = parsed.data;

  let query = db.from('exercises').select('*', { count: 'exact' });

  if (muscle_group !== undefined) query = query.contains('muscle_groups', [muscle_group]);
  if (equipment !== undefined) query = query.contains('equipment', [equipment]);
  if (difficulty !== undefined) query = query.eq('difficulty', difficulty);
  if (is_public !== undefined) query = query.eq('is_public', is_public);
  if (search !== undefined && search.length > 0)
    query = query.textSearch('name', search, { type: 'websearch' });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return c.json({ error: error.message }, 500);

  let skipped = 0;
  const validRows = (data ?? []).flatMap((row) => {
    const result = ExerciseSchema.safeParse(row);
    if (!result.success) {
      console.error('Row failed ExerciseSchema validation', row, result.error);
      skipped++;
      return [];
    }
    return [result.data];
  });

  return c.json({
    data: validRows,
    total: count ?? 0,
    limit,
    offset,
    error: null,
    ...(skipped > 0 ? { skipped } : {}),
  });
});

exercises.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Invalid exercise id — must be a UUID' }, 400);
  }

  const { data, error } = await db.from('exercises').select('*').eq('id', id).single();

  if (error || !data) return c.json({ error: 'Not found' }, 404);

  return c.json({ data: ExerciseSchema.parse(data), error: null });
});

exercises.post('/', requireRole('coach'), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = CreateExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const sub = c.get('claims').sub;

  const { data, error } = await db
    .from('exercises')
    .insert({ ...parsed.data, created_by: sub })
    .select()
    .single();

  if (error || !data) return c.json({ error: error?.message ?? 'Insert failed' }, 500);

  return c.json({ data: ExerciseSchema.parse(data), error: null }, 201);
});

exercises.patch('/:id', requireRole('coach'), async (c) => {
  const id = c.req.param('id');
  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Invalid exercise id — must be a UUID' }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = UpdateExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const sub = c.get('claims').sub;

  const { data: existing, error: fetchError } = await db
    .from('exercises')
    .select('created_by')
    .eq('id', id)
    .single();

  if (fetchError || !existing) return c.json({ error: 'Not found' }, 404);
  if (existing.created_by !== sub) return c.json({ error: 'Forbidden' }, 403);

  const { data, error } = await db
    .from('exercises')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return c.json({ error: error?.message ?? 'Update failed' }, 500);

  return c.json({ data: ExerciseSchema.parse(data), error: null });
});

exercises.delete('/:id', requireRole('coach'), async (c) => {
  const id = c.req.param('id');
  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Invalid exercise id — must be a UUID' }, 400);
  }

  const sub = c.get('claims').sub;

  const { data: existing, error: fetchError } = await db
    .from('exercises')
    .select('created_by')
    .eq('id', id)
    .single();

  if (fetchError || !existing) return c.json({ error: 'Not found' }, 404);
  if (existing.created_by !== sub) return c.json({ error: 'Forbidden' }, 403);

  const { error } = await db.from('exercises').delete().eq('id', id);

  if (error) return c.json({ error: error.message }, 500);

  return c.body(null, 204);
});

export { exercises };
