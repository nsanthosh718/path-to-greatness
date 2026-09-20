-- FamilyBoard seed data for Aadhi and Nirva.
--
-- Safe to re-run after edits: it deletes any prior rows for these two kids
-- (by slug) before re-inserting, so tweaking this file and re-running it in
-- the Supabase SQL editor won't pile up duplicates. NOTE: because of that
-- delete-then-insert, re-running this AFTER the family has started actually
-- using the app will also wipe that kid's chore-completion history and point
-- balance back to zero — fine during setup, not something to run casually
-- once you're relying on the points/rewards history. Global rewards
-- (available to "Everyone") are untouched either way.
--
-- Aadhi's soccer schedule below mirrors the weekly rhythm from his own
-- training tracker (github.com/nsanthosh718/path-to-mls, "Blue Tracker"):
-- Mon/Wed/Fri home sessions (A/B/C), Tue/Thu club practice, Sat game day,
-- Sun fully protected (no soccer). The specific drill content for each
-- session lives in that app, not here — this just blocks out the time and
-- mirrors a few of its daily mental-habit/recovery checklist items as chores.

delete from family_members where slug in ('five', 'ten', 'aadhi', 'nirva');

-- ---------------------------------------------------------------------------
-- Family members
-- ---------------------------------------------------------------------------
insert into family_members (slug, name, age, role, avatar_emoji, color, sort_order)
values
  ('nirva', 'Nirva', 5, 'kid', '🦋', '#f472b6', 1),
  ('aadhi', 'Aadhi', 10, 'kid', '⚽', '#38bdf8', 2);

-- ---------------------------------------------------------------------------
-- Schedule: Nirva — weekday (Mon-Fri)
-- Wake 6:15, bus-ready 6:50, back from school 2:35, bed by 9pm.
-- Daily reading, plus drawing/math/music rotating Mon/Wed/Fri; swim Tue,
-- soccer Thu.
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'nirva')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{1,2,3,4,5}'::int[], '06:15'::time, '06:50'::time, 'Wake Up & Get Ready for Bus', '🌞', 'routine', 1),
  ('{1,2,3,4,5}', '06:50', '14:35', 'School', '🏫', 'school', 2),
  ('{1,2,3,4,5}', '14:35', '15:00', 'Snack Time', '🍎', 'meal', 3),
  ('{1,2,3,4,5}', '15:00', '15:20', 'Chore Time', '🧹', 'chore', 4),
  ('{1,2,3,4,5}', '15:20', '15:50', 'Reading Time', '📖', 'school', 5),
  ('{1}', '15:50', '16:20', 'Drawing', '🎨', 'play', 6),
  ('{3}', '15:50', '16:20', 'Math Practice', '✏️', 'school', 6),
  ('{5}', '15:50', '16:20', 'Music Practice', '🎵', 'play', 6),
  ('{1,3,5}', '16:20', '18:00', 'Free Play', '🧸', 'play', 7),
  ('{2}', '15:50', '17:00', 'Free Play', '🧸', 'play', 7),
  ('{2}', '17:00', '17:30', 'Swimming', '🏊', 'play', 8),
  ('{2}', '17:30', '18:30', 'Wind Down', '🧸', 'play', 9),
  ('{4}', '15:50', '17:30', 'Free Play', '🧸', 'play', 7),
  ('{4}', '17:30', '18:30', 'Soccer Practice', '⚽', 'play', 8),
  ('{1,2,3,4,5}', '18:30', '19:00', 'Dinner', '🍽️', 'meal', 10),
  ('{1,2,3,4,5}', '19:00', '19:30', 'Bath Time', '🛁', 'routine', 11),
  ('{1,2,3,4,5}', '19:30', '20:30', 'Family / Story Time', '📖', 'routine', 12),
  ('{1,2,3,4,5}', '20:30', '20:50', 'Bedtime Routine', '🌙', 'routine', 13),
  ('{1,2,3,4,5}', '20:50', '21:00', 'Lights Out', '🌙', 'sleep', 14)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- Schedule: Nirva — weekend (Sat/Sun), bedtime aligned to the same 9pm.
with kid as (select id from family_members where slug = 'nirva')
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
  ('{0,6}', '17:30', '18:30', 'Screen Time / Free Play', '📺', 'play', 12),
  ('{0,6}', '18:30', '19:00', 'Dinner', '🍽️', 'meal', 13),
  ('{0,6}', '19:00', '19:30', 'Bath Time', '🛁', 'routine', 14),
  ('{0,6}', '19:30', '20:30', 'Story / Reading Time', '📖', 'routine', 15),
  ('{0,6}', '20:30', '20:50', 'Bedtime Routine', '🌙', 'routine', 16),
  ('{0,6}', '20:50', '21:00', 'Lights Out', '🌙', 'sleep', 17)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- ---------------------------------------------------------------------------
-- Schedule: Aadhi — weekday. Homework/school as before; the old generic
-- "Sports / Free Play" slot is now his real Blue Tracker weekly rhythm.
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'aadhi')
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
  ('{1}', '17:00', '18:00', 'Soccer: Home Session A', '⚽', 'play', 8),
  ('{2}', '17:00', '18:00', 'Soccer: Club Practice', '⚽', 'play', 8),
  ('{3}', '17:00', '18:00', 'Soccer: Home Session B', '⚽', 'play', 8),
  ('{4}', '17:00', '18:00', 'Soccer: Club Practice', '⚽', 'play', 8),
  ('{5}', '17:00', '18:00', 'Soccer: Home Session C', '⚽', 'play', 8),
  ('{1,2,3,4,5}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 9),
  ('{1,2,3,4,5}', '18:30', '19:00', 'Mind & Recovery Check-In', '🧠', 'routine', 10),
  ('{1,2,3,4,5}', '19:00', '19:30', 'Screen Time / Reading', '🎮', 'play', 11),
  ('{1,2,3,4,5}', '19:30', '20:00', 'Get Ready for Bed', '🪥', 'routine', 12),
  ('{1,2,3,4,5}', '20:00', '20:30', 'Reading in Bed', '📖', 'routine', 13),
  ('{1,2,3,4,5}', '20:30', '20:45', 'Lights Out', '🌙', 'sleep', 14)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- Schedule: Aadhi — Saturday (game day) and Sunday (protected free day,
-- where the drawing/music/math/reading activities land since weekdays are
-- already full with school + soccer + homework).
with kid as (select id from family_members where slug = 'aadhi')
insert into schedule_items (family_member_id, days_of_week, start_time, end_time, title, icon, category, sort_order)
select kid.id, days, start_time, end_time, title, icon, category, sort_order
from kid, (values
  ('{6}'::int[], '08:00'::time, '08:30'::time, 'Wake Up', '🌞', 'routine', 1),
  ('{6}', '08:30', '09:00', 'Breakfast', '🥣', 'meal', 2),
  ('{6}', '09:00', '11:00', 'Game Day (check Blue Tracker for time)', '⚽', 'play', 3),
  ('{6}', '11:00', '12:00', 'Post-Game Recovery & Snack', '🍎', 'meal', 4),
  ('{6}', '12:00', '17:00', 'Free Time / Family', '🎮', 'play', 5),
  ('{6}', '17:00', '17:30', 'Chores', '🧹', 'chore', 6),
  ('{6}', '17:30', '18:00', 'Mind & Recovery Check-In', '🧠', 'routine', 7),
  ('{6}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 8),
  ('{6}', '18:30', '20:00', 'Family Movie / Game Night', '🎬', 'play', 9),
  ('{6}', '20:00', '20:30', 'Get Ready for Bed', '🪥', 'routine', 10),
  ('{6}', '20:30', '21:00', 'Reading', '📖', 'routine', 11),
  ('{6}', '21:00', '21:15', 'Lights Out', '🌙', 'sleep', 12),

  ('{0}', '08:00', '08:30', 'Wake Up', '🌞', 'routine', 1),
  ('{0}', '08:30', '09:00', 'Breakfast', '🥣', 'meal', 2),
  ('{0}', '09:00', '09:30', 'Chores', '🧹', 'chore', 3),
  ('{0}', '09:30', '10:00', 'Drawing', '🎨', 'play', 4),
  ('{0}', '10:00', '10:30', 'Music Practice', '🎵', 'play', 5),
  ('{0}', '10:30', '11:00', 'Reading', '📖', 'school', 6),
  ('{0}', '11:00', '12:00', 'Free Play / Family Outing', '🚴', 'play', 7),
  ('{0}', '12:00', '12:30', 'Lunch', '🍽️', 'meal', 8),
  ('{0}', '12:30', '14:30', 'Free Time / Hobbies', '🎨', 'play', 9),
  ('{0}', '14:30', '15:00', 'Math Practice', '✏️', 'school', 10),
  ('{0}', '15:00', '17:00', 'Family Outing / Playdate', '🚴', 'play', 11),
  ('{0}', '17:00', '18:00', 'Free Time', '🎮', 'play', 12),
  ('{0}', '18:00', '18:30', 'Dinner', '🍽️', 'meal', 13),
  ('{0}', '18:30', '20:00', 'Family Movie / Game Night', '🎬', 'play', 14),
  ('{0}', '20:00', '20:30', 'Get Ready for Bed', '🪥', 'routine', 15),
  ('{0}', '20:30', '21:00', 'Reading', '📖', 'routine', 16),
  ('{0}', '21:00', '21:15', 'Lights Out', '🌙', 'sleep', 17)
) as t(days, start_time, end_time, title, icon, category, sort_order);

-- ---------------------------------------------------------------------------
-- Chores: regular daily chores (unchanged point tiers from the original
-- draft — 5 pts for Nirva, 10 pts for Aadhi)
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'nirva')
insert into chores (family_member_id, title, icon, points, days_of_week, sort_order)
select kid.id, title, icon, points, '{0,1,2,3,4,5,6}'::int[], sort_order
from kid, (values
  ('Make Bed', '🛏️', 5, 1),
  ('Put Away Toys', '🧸', 5, 2),
  ('Feed the Pet', '🐶', 5, 3),
  ('Dirty Clothes in Hamper', '👕', 5, 4)
) as t(title, icon, points, sort_order);

with kid as (select id from family_members where slug = 'aadhi')
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

-- Aadhi's Mind & Recovery habits, mirrored from Blue Tracker's daily
-- checklist (a representative subset — the full list also has RESET-after-
-- a-mistake, in-session hydration, and sleep hours, which fit a habit-streak
-- tracker better than a one-tap chore; ask if you want those added too).
-- Runs on training/game days (Mon-Sat), not Sunday's protected rest day.
with kid as (select id from family_members where slug = 'aadhi')
insert into chores (family_member_id, title, icon, points, days_of_week, sort_order)
select kid.id, title, icon, points, '{1,2,3,4,5,6}'::int[], sort_order
from kid, (values
  ('Positive Self-Talk', '🗣️', 10, 7),
  ('Reflect on Today''s Session', '📝', 10, 8),
  ('Hydrate & Refuel After Training', '⚡', 10, 9),
  ('Visualize Before Training', '🧠', 10, 10)
) as t(title, icon, points, sort_order);

-- ---------------------------------------------------------------------------
-- Bonus chores — "extra stars": worth more than the regular daily chores
-- above, available to both kids, any day.
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug in ('nirva', 'aadhi'))
insert into chores (family_member_id, title, icon, points, days_of_week, sort_order)
select kid.id, title, icon, points, '{0,1,2,3,4,5,6}'::int[], sort_order
from kid, (values
  ('Laundry', '🧺', 15, 20),
  ('Run the Dishwasher (Full Load)', '🍽️', 15, 21),
  ('Clean Up Clothes', '👕', 15, 22),
  ('Arrange the Shoes', '👟', 15, 23),
  ('Keep Floors Spotless (Pick Up Litter)', '🧹', 15, 24),
  ('Clean Up Toys Before Bed', '🧸', 15, 25),
  ('Rinse & Load Dishes Right After Eating', '⏱️', 15, 26),
  ('Keep Sofa Clean Before Leaving Living Area', '🛋️', 15, 27)
) as t(title, icon, points, sort_order);

-- ---------------------------------------------------------------------------
-- Rewards catalog (available to every kid) — unchanged
-- ---------------------------------------------------------------------------
insert into rewards (family_member_id, title, icon, points_cost, sort_order)
select null, title, icon, points_cost, sort_order
from (values
  ('Extra 30 Min Screen Time', '📱', 30, 1),
  ('Stay Up 30 Min Late', '🌙', 40, 2),
  ('Pick the Family Movie', '🎬', 50, 3),
  ('Choose Dinner Tonight', '🍕', 60, 4),
  ('Small Treat or Toy', '🎁', 100, 5),
  ('Special Outing', '🎡', 200, 6)
) as t(title, icon, points_cost, sort_order)
where not exists (select 1 from rewards where family_member_id is null);

-- ---------------------------------------------------------------------------
-- Voice lines: spoken narration read aloud by a tap-to-hear button in the
-- app, since Nirva can't read yet. Matched by title, so every occurrence of
-- a repeated title (e.g. "Dinner" showing up on several different days)
-- picks up the same line from one statement.
-- ---------------------------------------------------------------------------
with kid as (select id from family_members where slug = 'nirva')
update schedule_items si set voice_line = v.voice_line
from kid, (values
  ('Wake Up & Get Ready for Bus', 'Good morning, sunshine! Time to wake up, get dressed, and get ready for the school bus.'),
  ('School', 'Off to school! Have a wonderful day and learn lots of new things.'),
  ('Snack Time', 'Welcome home! Let''s have a yummy snack.'),
  ('Chore Time', 'Time to help out! Let''s do your chores together.'),
  ('Reading Time', 'Story time! Let''s read a book together.'),
  ('Drawing', 'Time to be an artist! Let''s draw something colorful.'),
  ('Math Practice', 'Let''s practice some fun math!'),
  ('Music Practice', 'Time to make some music!'),
  ('Free Play', 'Yay, free play time! You can play with anything you like.'),
  ('Swimming', 'Time for swimming! Grab your swimsuit, it''s pool time.'),
  ('Wind Down', 'Great swimming! Let''s dry off and relax for a bit.'),
  ('Soccer Practice', 'Time for soccer practice! Let''s go kick the ball.'),
  ('Dinner', 'Dinner time! Let''s wash your hands and come eat.'),
  ('Bath Time', 'Splish splash! Time for your bath.'),
  ('Family / Story Time', 'Let''s snuggle up for family and story time.'),
  ('Bedtime Routine', 'Time to get ready for bed. Brush your teeth and put on your pajamas.'),
  ('Lights Out', 'Lights out! Sweet dreams, see you in the morning.'),
  ('Wake Up', 'Good morning! Time to wake up and start your day.'),
  ('Breakfast', 'Breakfast time! Let''s eat something yummy.'),
  ('Cartoons / Screen Time', 'Time to relax and watch something fun.'),
  ('Family Time / Outing', 'Let''s go have some fun family time together!'),
  ('Lunch', 'Lunch time! Let''s eat and refuel.'),
  ('Quiet Time / Nap', 'Time for some quiet rest. Close your eyes and relax.'),
  ('Play / Activities', 'Time for fun activities! What do you want to do?'),
  ('Snack', 'Snack time! Let''s have a little bite.'),
  ('Family Time', 'Let''s spend some fun time together as a family.'),
  ('Screen Time / Free Play', 'Time to relax with screen time or free play.'),
  ('Story / Reading Time', 'Let''s read a story together.')
) as v(title, voice_line)
where si.family_member_id = kid.id and si.title = v.title;

with kid as (select id from family_members where slug = 'aadhi')
update schedule_items si set voice_line = v.voice_line
from kid, (values
  ('Wake Up', 'Good morning, champ! Time to get up and start the day.'),
  ('Breakfast', 'Breakfast time! Fuel up for the day ahead.'),
  ('Get Ready & Pack Backpack', 'Time to get ready and pack your backpack for school.'),
  ('School', 'Off to school! Have a great day.'),
  ('Snack & Unwind', 'Welcome home! Grab a snack and take a breather.'),
  ('Chores', 'Time to knock out your chores.'),
  ('Homework', 'Homework time! Let''s get it done.'),
  ('Soccer: Home Session A', 'Time for your home training session! Bring your best effort.'),
  ('Soccer: Club Practice', 'Time for club practice! Give it everything you''ve got.'),
  ('Soccer: Home Session B', 'Time for your home training session! Focus and have fun.'),
  ('Soccer: Home Session C', 'Time for your home training session! Finish the week strong.'),
  ('Dinner', 'Dinner time! Let''s eat and recharge.'),
  ('Mind & Recovery Check-In', 'Time to check in on your mind and recovery habits.'),
  ('Screen Time / Reading', 'Time to relax with some screen time or reading.'),
  ('Get Ready for Bed', 'Time to get ready for bed.'),
  ('Reading in Bed', 'Time for some quiet reading in bed.'),
  ('Lights Out', 'Lights out! Rest up, big day tomorrow.'),
  ('Game Day (check Blue Tracker for time)', 'It''s game day! Check Blue Tracker for the exact time and get ready to play.'),
  ('Post-Game Recovery & Snack', 'Great game! Time to refuel and recover.'),
  ('Free Time / Family', 'Enjoy some free time with the family.'),
  ('Family Movie / Game Night', 'Time for family movie or game night!'),
  ('Free Play / Family Outing', 'Time for free play or a family outing.'),
  ('Lunch', 'Lunch time! Let''s eat.'),
  ('Free Time / Hobbies', 'Time for your hobbies and free time.'),
  ('Family Outing / Playdate', 'Time for a family outing or a playdate.'),
  ('Free Time', 'Enjoy some free time.'),
  ('Drawing', 'Time to draw something creative!'),
  ('Music Practice', 'Time to practice music!'),
  ('Reading', 'Time for some reading.'),
  ('Math Practice', 'Time to practice some math.')
) as v(title, voice_line)
where si.family_member_id = kid.id and si.title = v.title;

with kid as (select id from family_members where slug = 'nirva')
update chores c set voice_line = v.voice_line
from kid, (values
  ('Make Bed', 'Let''s make your bed nice and tidy!'),
  ('Put Away Toys', 'Time to put your toys away!'),
  ('Feed the Pet', 'Don''t forget to feed your pet!'),
  ('Dirty Clothes in Hamper', 'Put your dirty clothes in the hamper, please!')
) as v(title, voice_line)
where c.family_member_id = kid.id and c.title = v.title;

with kid as (select id from family_members where slug = 'aadhi')
update chores c set voice_line = v.voice_line
from kid, (values
  ('Make Bed', 'Make your bed to start the day right.'),
  ('Load / Unload Dishwasher', 'Time to load or unload the dishwasher.'),
  ('Take Out Trash', 'Take out the trash, please.'),
  ('Tidy Room', 'Let''s tidy up your room.'),
  ('Pack Backpack & Lunch', 'Pack your backpack and lunch for tomorrow.'),
  ('Homework Check-In', 'Check in: is your homework all done?'),
  ('Positive Self-Talk', 'Remember to use positive self-talk today.'),
  ('Reflect on Today''s Session', 'Take a moment to reflect on today''s session.'),
  ('Hydrate & Refuel After Training', 'Don''t forget to hydrate and refuel after training.'),
  ('Visualize Before Training', 'Take a moment to visualize before training.')
) as v(title, voice_line)
where c.family_member_id = kid.id and c.title = v.title;

-- Shared bonus chores: same wording works for both kids, so match by title
-- only (no member filter) to cover both rows in one statement.
update chores c set voice_line = v.voice_line
from (values
  ('Laundry', 'Time to help with the laundry!'),
  ('Run the Dishwasher (Full Load)', 'Let''s run a full load in the dishwasher.'),
  ('Clean Up Clothes', 'Let''s clean up and put away your clothes.'),
  ('Arrange the Shoes', 'Time to line up all the shoes neatly.'),
  ('Keep Floors Spotless (Pick Up Litter)', 'Let''s pick up litter and keep the floors spotless.'),
  ('Clean Up Toys Before Bed', 'Time to clean up your toys before bed.'),
  ('Rinse & Load Dishes Right After Eating', 'Please rinse your dishes and load them right after eating.'),
  ('Keep Sofa Clean Before Leaving Living Area', 'Let''s keep the sofa clean before you leave the living room.')
) as v(title, voice_line)
where c.title = v.title;
