import { sql } from "drizzle-orm"
import { db } from "@/app/lib/db/db"

async function seed() {
  await db.execute(sql`BEGIN`)

  try {
    // Reserved courses
    await db.execute(sql`
      INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point)
      VALUES (-1, 'THE IpponBashi', 'route;route;route;route;start', TRUE,
        'u;null;mf;1;mf;1;mf;1;mf;1;tr;180;mf;1;mf;1;mf;1;mf;1', TRUE,
        '0;20;1;1;1;1;0;2;2;2;2')
      ON CONFLICT (id) DO NOTHING
    `)
    await db.execute(sql`
      INSERT INTO course (id, name, fieldvalid, missionvalid)
      VALUES (-2, 'SensorCourse', TRUE, TRUE)
      ON CONFLICT (id) DO NOTHING
    `)

    // Test umpire
    await db.execute(sql`
      INSERT INTO umpire (id, name)
      VALUES (1, 'TestUmpire')
      ON CONFLICT (id) DO NOTHING
    `)

    // Delete existing data to prevent test data duplication
    await db.execute(sql`
      DELETE FROM competition_course WHERE competition_id IN (
        SELECT id FROM competition WHERE name = 'テスト大会'
      )
    `)
    await db.execute(sql`
      DELETE FROM competition_player WHERE competition_id IN (
        SELECT id FROM competition WHERE name = 'テスト大会'
      )
    `)
    await db.execute(sql`
      DELETE FROM competition_umpire WHERE competition_id IN (
        SELECT id FROM competition WHERE name = 'テスト大会'
      )
    `)
    await db.execute(sql`DELETE FROM competition WHERE name = 'テスト大会'`)
    await db.execute(sql`DELETE FROM course WHERE name = 'TestCourse'`)
    await db.execute(
      sql`DELETE FROM player WHERE zekken IN ('001', '002', '003')`,
    )

    // Test T-course
    const courseResult = await db.execute<{ id: number }>(sql`
      INSERT INTO course (name, field, fieldvalid, mission, missionvalid, point)
      VALUES ('TestCourse',
        'start,null,null;route,null,null;route,null,null',
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

    // Assign umpire to competition
    await db.execute(sql`
      INSERT INTO competition_umpire (competition_id, umpire_id)
      VALUES (${competitionId}, 1)
    `)

    await db.execute(sql`COMMIT`)

    console.log("Seed completed.")
    console.log(`  Competition: テスト大会 (id=${competitionId})`)
    console.log(`  Course: TestCourse (id=${testCourseId})`)
    console.log(`  Players: ${playerResult.rows.length}名`)
  } catch (e) {
    await db.execute(sql`ROLLBACK`)
    throw e
  }
}

seed()
  .catch(console.error)
  .finally(() => process.exit())
