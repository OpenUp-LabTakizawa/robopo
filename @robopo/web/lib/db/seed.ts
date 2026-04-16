import { sql } from "drizzle-orm"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db/db"

async function seed() {
  await db.execute(sql`BEGIN`)

  try {
    // --- Insert special courses with positive IDs ---
    // THE One-Log Bridge (ID: 1)
    await db.execute(sql`
      INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point, course_out_rule)
      VALUES (1, 'THE一本橋',
        'route,null,null,null,null;route,null,null,null,null;route,null,null,null,null;route,null,null,null,null;startGoal,null,null,null,null',
        TRUE,
        'u;null;mf;1;mf;1;mf;1;mf;1;tr;180;mf;1;mf;1;mf;1;mf;1',
        TRUE,
        '0;20;1;1;1;1;0;2;2;2;2',
        'zero')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        field = EXCLUDED.field,
        fieldvalid = EXCLUDED.fieldvalid,
        mission = EXCLUDED.mission,
        missionvalid = EXCLUDED.missionvalid,
        point = EXCLUDED.point,
        course_out_rule = EXCLUDED.course_out_rule
    `)

    // Sensor Course (ID: 2)
    await db.execute(sql`
      INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point, course_out_rule)
      VALUES (2, 'センサーコース',
        'null,null,null,null,null;null,null,null,null,null;null,null,null,null,null;null,null,null,null,null;start,route,route,route,goal',
        TRUE,
        'r;r;mf;2;ps;0;mf;2;ps;0',
        TRUE,
        '0;0;0;10;0;(10,3,5,20,-5)',
        'keep')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        field = EXCLUDED.field,
        fieldvalid = EXCLUDED.fieldvalid,
        mission = EXCLUDED.mission,
        missionvalid = EXCLUDED.missionvalid,
        point = EXCLUDED.point,
        course_out_rule = EXCLUDED.course_out_rule
    `)

    // Reset course_id_seq to avoid conflicts with auto-increment
    await db.execute(sql`
      SELECT setval('course_id_seq', (SELECT COALESCE(MAX(id), 0) FROM course))
    `)

    // Known test judge usernames
    const judgeUsernames = ["testjudge", "judgeb", "judgec"]
    const usernameList = sql.join(
      judgeUsernames.map((u) => sql`${u}`),
      sql`, `,
    )

    // Clean up test judges by username (single-pass, targeted cleanup)
    await db.execute(sql`
      UPDATE challenge SET judge_id = NULL
      WHERE judge_id IN (
        SELECT j.id FROM judge j
        JOIN "user" u ON j.user_id = u.id
        WHERE u.username IN (${usernameList})
      )
    `)
    await db.execute(sql`
      DELETE FROM competition_judge
      WHERE judge_id IN (
        SELECT j.id FROM judge j
        JOIN "user" u ON j.user_id = u.id
        WHERE u.username IN (${usernameList})
      )
    `)
    await db.execute(sql`
      DELETE FROM judge
      WHERE user_id IN (SELECT id FROM "user" WHERE username IN (${usernameList}))
    `)
    await db.execute(sql`
      DELETE FROM "user" WHERE username IN (${usernameList})
    `)
    await db.execute(sql`
      SELECT setval('judge_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM judge), 1))
    `)

    // Create judge accounts (user + judge record)
    async function createJudgeAccount(username: string) {
      const res = await auth.api.signUpEmail({
        body: {
          email: `${username}@robopo.local`,
          password: "judge1234",
          name: username,
          username,
        },
      })
      if (!res?.user?.id) {
        return
      }
      await db.execute(sql`
        INSERT INTO judge (user_id) VALUES (${res.user.id})
      `)
      console.log(`  Judge account created: ${username}`)
    }

    for (const uname of judgeUsernames) {
      try {
        await createJudgeAccount(uname)
      } catch (e) {
        console.error(`  Failed to create account for ${uname}:`, e)
      }
    }

    // Delete existing data to prevent test data duplication
    await db.execute(sql`
      DELETE FROM challenge WHERE competition_id IN (
        SELECT id FROM competition WHERE name IN ('テスト大会', 'ロボサバ2026')
      )
    `)
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
      DELETE FROM competition_judge WHERE competition_id IN (
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
      sql`DELETE FROM player WHERE bib_number IN ('001', '002', '003')`,
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

    // Test competition (active: start_date in past, end_date in future)
    const compResult = await db.execute<{ id: number }>(sql`
      INSERT INTO competition (name, start_date, end_date)
      VALUES ('テスト大会', NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days')
      RETURNING id
    `)
    const competitionId = compResult.rows[0].id

    // Test players
    const playerResult = await db.execute<{ id: number }>(sql`
      INSERT INTO player (name, furigana, bib_number) VALUES
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

    // Assign judges to competition
    const judgeRows = await db.execute<{ id: number }>(sql`
      SELECT id FROM judge ORDER BY id
    `)
    for (const u of judgeRows.rows) {
      await db.execute(sql`
        INSERT INTO competition_judge (competition_id, judge_id)
        VALUES (${competitionId}, ${u.id})
      `)
    }

    // --- Second competition (also active) ---
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
      INSERT INTO competition (name, start_date, end_date)
      VALUES ('ロボサバ2026', NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days')
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

    // Assign judges to second competition
    for (const u of judgeRows.rows) {
      await db.execute(sql`
        INSERT INTO competition_judge (competition_id, judge_id)
        VALUES (${competition2Id}, ${u.id})
      `)
    }

    // --- Challenge data for Test Competition × TestCourse ---
    // TestCourse point='0;10;5;5': result 0→0pt, 1→5pt, 2→20pt (full clear)
    const judgeId1 = judgeRows.rows[0].id
    const [pA, pB, pC] = playerResult.rows

    // Player A: 3 challenges, best=2 (full clear 20pt), achieved on 2nd attempt
    await db.execute(sql`
      INSERT INTO challenge (first_result, retry_result, detail, competition_id, course_id, player_id, judge_id, created_at)
      VALUES
        (1, NULL, NULL, ${competitionId}, ${testCourseId}, ${pA.id}, ${judgeId1}, NOW() - INTERVAL '5 hours'),
        (1, 2,    NULL, ${competitionId}, ${testCourseId}, ${pA.id}, ${judgeId1}, NOW() - INTERVAL '3 hours'),
        (2, NULL, NULL, ${competitionId}, ${testCourseId}, ${pA.id}, ${judgeId1}, NOW() - INTERVAL '1 hour')
    `)

    // Player B: 2 challenges, best=2 (full clear 20pt), achieved on 1st attempt
    await db.execute(sql`
      INSERT INTO challenge (first_result, retry_result, detail, competition_id, course_id, player_id, judge_id, created_at)
      VALUES
        (2, 1,    NULL, ${competitionId}, ${testCourseId}, ${pB.id}, ${judgeId1}, NOW() - INTERVAL '4 hours'),
        (2, NULL, NULL, ${competitionId}, ${testCourseId}, ${pB.id}, ${judgeId1}, NOW() - INTERVAL '2 hours')
    `)

    // Player C: 4 challenges, best=1 (5pt), never completed the course
    await db.execute(sql`
      INSERT INTO challenge (first_result, retry_result, detail, competition_id, course_id, player_id, judge_id, created_at)
      VALUES
        (0, 1,    NULL, ${competitionId}, ${testCourseId}, ${pC.id}, ${judgeId1}, NOW() - INTERVAL '6 hours'),
        (1, 0,    NULL, ${competitionId}, ${testCourseId}, ${pC.id}, ${judgeId1}, NOW() - INTERVAL '4 hours'),
        (0, NULL, NULL, ${competitionId}, ${testCourseId}, ${pC.id}, ${judgeId1}, NOW() - INTERVAL '2 hours'),
        (1, 1,    NULL, ${competitionId}, ${testCourseId}, ${pC.id}, ${judgeId1}, NOW() - INTERVAL '30 minutes')
    `)

    // --- Associate special courses (ID 1, 2) with ALL competitions ---
    await db.execute(sql`
      INSERT INTO competition_course (competition_id, course_id)
      SELECT c.id, sc.id
      FROM competition c
      CROSS JOIN (SELECT id FROM course WHERE id IN (1, 2)) sc
      WHERE NOT EXISTS (
        SELECT 1 FROM competition_course cc
        WHERE cc.competition_id = c.id AND cc.course_id = sc.id
      )
    `)

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
