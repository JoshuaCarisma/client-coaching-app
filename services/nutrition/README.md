# service: nutrition

Owns recipes, meal plans, adherence logs, the client recipe library, and macro targets.

Responsibilities:
- Recipe management — ingredients, macros, instructions, coach-created and templated
- Meal plan builder — ordered meal sequences tied to coaching goals
- Adherence logging — client marks recipe adherence; links to calendar schedule object
- Client recipe library — substitution tracking, personal preferences
- Macro and calorie targets per client
- Meal photo metadata for coach review (asset stored via ingestion boundary)
- Shopping list generation from meal plans
- Emits `recipe.adherence.logged` events consumed by Analytics

Permission tiers must be enforced:
- General guidance: any coach can set macro targets and recommend recipes
- Meal review: coach reviews client-submitted meal photos
- Full meal planning: requires coach credential gating — not available by default

Nutrition exposes meal definitions. Calendar schedules them. Nutrition never schedules itself.
This service does NOT handle medical dietary prescription.
