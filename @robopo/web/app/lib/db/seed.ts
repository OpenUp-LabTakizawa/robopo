import { sql } from "drizzle-orm"
import { db } from "@/app/lib/db/db"

async function seed() {
  await db.execute(sql`BEGIN`)

  try {
    // Reserved courses
    await db.execute(sql`
      INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point)
      VALUES (-1, 'THE IpponBashi', 'route;route;route;route;startGoal', TRUE,
        'u;null;mf;1;mf;1;mf;1;mf;1;tr;180;mf;1;mf;1;mf;1;mf;1', TRUE,
        '0;20;1;1;1;1;0;2;2;2;2')
      ON CONFLICT (id) DO UPDATE SET
        field = EXCLUDED.field,
        mission = EXCLUDED.mission,
        point = EXCLUDED.point
    `)
    await db.execute(sql`
      INSERT INTO course (id, name, fieldvalid, missionvalid)
      VALUES (-2, 'SensorCourse', TRUE, TRUE)
      ON CONFLICT (id) DO NOTHING
    `)

    // Test umpires
    await db.execute(sql`
      INSERT INTO umpire (id, name)
      VALUES (1, 'TestUmpire')
      ON CONFLICT (id) DO NOTHING
    `)
    await db.execute(sql`
      DELETE FROM competition_umpire WHERE umpire_id IN (
        SELECT id FROM umpire WHERE name IN ('審判B', '審判C')
      )
    `)
    await db.execute(sql`DELETE FROM umpire WHERE name IN ('審判B', '審判C')`)
    await db.execute(sql`
      SELECT setval('umpire_id_seq', (SELECT COALESCE(MAX(id), 0) FROM umpire))
    `)
    await db.execute(sql`
      INSERT INTO umpire (name) VALUES ('審判B'), ('審判C')
    `)

    // Delete existing data to prevent test data duplication
    await db.execute(sql`
      DELETE FROM competition_course WHERE competition_id IN (
        SELECT id FROM competition WHERE name IN ('テスト大会', 'ロボサバ2026')
      )
    `)
    await db.execute(sql`
      DELETE FROM competition_player WHERE competition_id IN (
        SELECT id FROM competition WHERE name IN ('テスト大会', 'ロボサバ2026')
      )
    `)
    await db.execute(sql`
      DELETE FROM competition_umpire WHERE competition_id IN (
        SELECT id FROM competition WHERE name IN ('テスト大会', 'ロボサバ2026')
      )
    `)
    await db.execute(
      sql`DELETE FROM competition WHERE name IN ('テスト大会', 'ロボサバ2026')`,
    )
    await db.execute(
      sql`DELETE FROM course WHERE name IN ('TestCourse', 'TestCourse2')`,
    )
    await db.execute(
      sql`DELETE FROM player WHERE zekken IN ('001', '002', '003')`,
    )

    // Test T-course
    const courseResult = await db.execute<{ id: number }>(sql`
      INSERT INTO course (name, field, fieldvalid, mission, missionvalid, point)
      VALUES ('TestCourse',
        'goal,null,null;route,null,null;start,null,null',
        TRUE,
        'u;null;mf;1;mf;1',
        TRUE,
        '0;10;5;5')
      RETURNING id
    `)
    const testCourseId = courseResult.rows[0].id

    // Test competition (in progress: step=1)
    const compResult = await db.execute<{ id: number }>(sql`
      INSERT INTO competition (name, step)
      VALUES ('テスト大会', 1)
      RETURNING id
    `)
    const competitionId = compResult.rows[0].id

    // Test players
    const playerResult = await db.execute<{ id: number }>(sql`
      INSERT INTO player (name, furigana, zekken) VALUES
        ('選手A', 'センシュエー', '001'),
        ('選手B', 'センシュビー', '002'),
        ('選手C', 'センシュシー', '003')
      RETURNING id
    `)

    // Assign course to competition
    await db.execute(sql`
      INSERT INTO competition_course (competition_id, course_id)
      VALUES (${competitionId}, ${testCourseId})
    `)

    // Assign players to competition
    for (const p of playerResult.rows) {
      await db.execute(sql`
        INSERT INTO competition_player (competition_id, player_id)
        VALUES (${competitionId}, ${p.id})
      `)
    }

    // Assign umpires to competition
    const umpireRows = await db.execute<{ id: number }>(sql`
      SELECT id FROM umpire ORDER BY id
    `)
    for (const u of umpireRows.rows) {
      await db.execute(sql`
        INSERT INTO competition_umpire (competition_id, umpire_id)
        VALUES (${competitionId}, ${u.id})
      `)
    }

    // --- Second competition (also in progress: step=1) ---
    const course2Result = await db.execute<{ id: number }>(sql`
      INSERT INTO course (name, field, fieldvalid, mission, missionvalid, point)
      VALUES ('TestCourse2',
        'goal,route,null;null,route,null;null,start,null',
        TRUE,
        'u;null;mf;1;mf;1;tl;90;mf;1',
        TRUE,
        '0;15;5;5;0;10')
      RETURNING id
    `)
    const testCourse2Id = course2Result.rows[0].id

    const comp2Result = await db.execute<{ id: number }>(sql`
      INSERT INTO competition (name, step)
      VALUES ('ロボサバ2026', 1)
      RETURNING id
    `)
    const competition2Id = comp2Result.rows[0].id

    // Assign course to second competition
    await db.execute(sql`
      INSERT INTO competition_course (competition_id, course_id)
      VALUES (${competition2Id}, ${testCourse2Id})
    `)

    // Assign same players to second competition
    for (const p of playerResult.rows) {
      await db.execute(sql`
        INSERT INTO competition_player (competition_id, player_id)
        VALUES (${competition2Id}, ${p.id})
      `)
    }

    // Assign umpires to second competition
    for (const u of umpireRows.rows) {
      await db.execute(sql`
        INSERT INTO competition_umpire (competition_id, umpire_id)
        VALUES (${competition2Id}, ${u.id})
      `)
    }

    await db.execute(sql`COMMIT`)

    console.log("Seed completed.")
    console.log(`  Competition 1: テスト大会 (id=${competitionId})`)
    console.log(`  Competition 2: ロボサバ2026 (id=${competition2Id})`)
    console.log(`  Course 1: TestCourse (id=${testCourseId})`)
    console.log(`  Course 2: TestCourse2 (id=${testCourse2Id})`)
    console.log(`  Players: ${playerResult.rows.length}名`)
  } catch (e) {
    await db.execute(sql`ROLLBACK`)
    throw e
  }
}

seed()
  .catch(console.error)
  .finally(() => process.exit())
