-- FamilyBoard seed data: a draft daily-schedule template for a 5-year-old
-- and a 10-year-old. Run AFTER schema.sql, once. Everything here is meant
-- to be edited: rename the kids, and adjust times/chores/rewards from the
-- Admin screen (or directly in these tables) to match real school hours,
-- activities, and house rules.

-- ---------------------------------------------------------------------------
-- Family members
-- ---------------------------------------------------------------------------
insert into family_members (slug, name, age, role, avatar_emoji, color, sort_order)
values
  ('five', 'Age 5', 5, 'kid', '🦖', '#f472b6', 1),
  ('ten', 'Age 10', 10, 'kid', '🚀', '#38bdf8', 2)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Schedule: Age 5 — weekday (Mon-Fri = 1,2,3,4,5)
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'five')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{1,2,3,4,5}'::int[], '06:30'::time, '07:00'::time, 'Wake Up & Get Dressed', '🌞', 'routine', 1),
  ('{1,2,3,4,5}', '07:00', '07:30', 'Breakfast', '🥣', 'meal', 2),
  ('{1,2,3,4,5}', '07:30', '07:45', 'Brush Teeth', '🪥', 'routine', 3),
  ('{1,2,3,4,5}', '08:00', '15:00', 'School', '🏫', 'school', 4),
  ('{1,2,3,4,5}', '15:00', '15:30', 'Snack Time', '🍎', 'meal', 5),
  ('{1,2,3,4,5}', '15:30', '16:00', 'Free Play', '🧸', 'play', 6),
  ('{1,2,3,4,5}', '16:00', '16:20', 'Chore Time', '🧹', 'chore', 7),
  ('{1,2,3,4,5}', '16:20', '17:00', 'Reading & Learning Time', '📚', 'school', 8),
  ('{1,2,3,4,5}', '17:00', '17:45', 'Outside Play', '🌳', 'play', 9),
  ('{1,2,3,4,5}', '17:45', '18:15', 'Screen Time', '📺', 'play', 10),
  ('{1,2,3,4,5}', '18:15', '18:45', 'Dinner', '🍽️', 'meal', 11),
  ('{1,2,3,4,5}', '18:45', '19:15', 'Bath Time', '🛁', 'routine', 12),
  ('{1,2,3,4,5}', '19:15', '19:35', 'Story Time', '📖', 'routine', 13),
  ('{1,2,3,4,5}', '19:35', '19:45', 'Lights Out', '🌙', 'sleep', 14)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- Schedule: Age 5 — weekend (Sat/Sun = 6,0)
with kid as (select id from family_members where slug = 'five')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{0,6}'::int[], '07:30'::time, '08:00'::time, 'Wake Up', '🌞', 'routine', 1),
  ('{0,6}', '08:00', '08:30', 'Breakfast', '🥣', 'meal', 2),
  ('{0,6}', '08:30', '09:00', 'Cartoons / Screen Time', '📺', 'play', 3),
  ('{0,6}', '09:00', '11:00', 'Family Time / Outing', '🚴', 'play', 4),
  ('{0,6}', '11:00', '12:00', 'Free Play', '🧸', 'play', 5),
  ('{0,6}', '12:00', '12:30', 'Lunch', '🍽️', 'meal', 6),
  ('{0,6}', '12:30', '13:30', 'Quiet Time / Nap', '😴', 'sleep', 7),
  ('{0,6}', '13:30', '15:30', 'Play / Activities', '🎨', 'play', 8),
  ('{0,6}', '15:30', '16:00', 'Snack', '🍎', 'meal', 9),
  ('{0,6}', '16:00', '17:00', 'Family Time', '👨‍👩‍👧', 'play', 10),
  ('{0,6}', '17:00', '17:30', 'Chore Time', '🧹', 'chore', 11),
  ('{0,6}', '17:30', '18:00', 'Screen Time', '📺', 'play', 12),
  ('{0,6}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 13),
  ('{0,6}', '18:30', '19:00', 'Bath Time', '🛁', 'routine', 14),
  ('{0,6}', '19:00', '19:30', 'Story Time', '📖', 'routine', 15),
  ('{0,6}', '19:30', '19:45', 'Lights Out', '🌙', 'sleep', 16)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- ---------------------------------------------------------------------------
-- Schedule: Age 10 — weekday
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'ten')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{1,2,3,4,5}'::int[], '06:30'::time, '07:00'::time, 'Wake Up', '🌞', 'routine', 1),
  ('{1,2,3,4,5}', '07:00', '07:30', 'Breakfast', '🥣', 'meal', 2),
  ('{1,2,3,4,5}', '07:30', '08:00', 'Get Ready & Pack Backpack', '🎒', 'routine', 3),
  ('{1,2,3,4,5}', '08:00', '15:00', 'School', '🏫', 'school', 4),
  ('{1,2,3,4,5}', '15:00', '15:30', 'Snack & Unwind', '🍎', 'meal', 5),
  ('{1,2,3,4,5}', '15:30', '16:00', 'Chores', '🧹', 'chore', 6),
  ('{1,2,3,4,5}', '16:00', '17:00', 'Homework', '✏️', 'school', 7),
  ('{1,2,3,4,5}', '17:00', '18:00', 'Sports / Activity / Free Play', '⚽', 'play', 8),
  ('{1,2,3,4,5}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 9),
  ('{1,2,3,4,5}', '18:30', '19:30', 'Screen Time / Reading', '🎮', 'play', 10),
  ('{1,2,3,4,5}', '19:30', '20:00', 'Get Ready for Bed', '🪥', 'routine', 11),
  ('{1,2,3,4,5}', '20:00', '20:30', 'Reading in Bed', '📖', 'routine', 12),
  ('{1,2,3,4,5}', '20:30', '20:45', 'Lights Out', '🌙', 'sleep', 13)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- Schedule: Age 10 — weekend
with kid as (select id from family_members where slug = 'ten')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{0,6}'::int[], '08:00'::time, '08:30'::time, 'Wake Up', '🌞', 'routine', 1),
  ('{0,6}', '08:30', '09:00', 'Breakfast', '🥣', 'meal', 2),
  ('{0,6}', '09:00', '10:00', 'Chores', '🧹', 'chore', 3),
  ('{0,6}', '10:00', '12:00', 'Activities / Sports / Free Time', '⚽', 'play', 4),
  ('{0,6}', '12:00', '12:30', 'Lunch', '🍽️', 'meal', 5),
  ('{0,6}', '12:30', '14:30', 'Free Time / Hobbies', '🎨', 'play', 6),
  ('{0,6}', '14:30', '16:30', 'Family Outing / Playdate', '🚴', 'play', 7),
  ('{0,6}', '16:30', '17:00', 'Snack', '🍎', 'meal', 8),
  ('{0,6}', '17:00', '18:00', 'Free Time', '🎮', 'play', 9),
  ('{0,6}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 10),
  ('{0,6}', '18:30', '20:00', 'Family Movie / Game Night', '🎬', 'play', 11),
  ('{0,6}', '20:00', '20:30', 'Get Ready for Bed', '🪥', 'routine', 12),
  ('{0,6}', '20:30', '21:00', 'Reading', '📖', 'routine', 13),
  ('{0,6}', '21:00', '21:15', 'Lights Out', '🌙', 'sleep', 14)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- ---------------------------------------------------------------------------
-- Chores
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'five')
insert into chores (family_member_id, title, icon, points, days_of_week, sort_order)
select kid.id, title, icon, points, '{0,1,2,3,4,5,6}'::int[], sort_order
from kid, (values
  ('Make Bed', '🛏️', 5, 1),
  ('Put Away Toys', '🧸', 5, 2),
  ('Feed the Pet', '🐶', 5, 3),
  ('Dirty Clothes in Hamper', '👕', 5, 4)
) as t(title, icon, points, sort_order);

with kid as (select id from family_members where slug = 'ten')
insert into chores (family_member_id, title, icon, points, days_of_week, sort_order)
select kid.id, title, icon, points, '{0,1,2,3,4,5,6}'::int[], sort_order
from kid, (values
  ('Make Bed', '🛏️', 10, 1),
  ('Load / Unload Dishwasher', '🍽️', 10, 2),
  ('Take Out Trash', '🗑️', 10, 3),
  ('Tidy Room', '🧹', 10, 4),
  ('Pack Backpack & Lunch', '🎒', 10, 5),
  ('Homework Check-In', '✅', 10, 6)
) as t(title, icon, points, sort_order);

-- ---------------------------------------------------------------------------
-- Rewards catalog (available to every kid)
-- ---------------------------------------------------------------------------
insert into rewards (family_member_id, title, icon, points_cost, sort_order)
values
  (null, 'Extra 30 Min Screen Time', '📱', 30, 1),
  (null, 'Stay Up 30 Min Late', '🌙', 40, 2),
  (null, 'Pick the Family Movie', '🎬', 50, 3),
  (null, 'Choose Dinner Tonight', '🍕', 60, 4),
  (null, 'Small Treat or Toy', '🎁', 100, 5),
  (null, 'Special Outing', '🎡', 200, 6);
