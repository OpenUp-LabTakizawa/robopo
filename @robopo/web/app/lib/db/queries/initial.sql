-- THE一本橋のコースをID 1 に挿入する
INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point, course_out_rule) VALUES (1, 'THE一本橋', 'route,null,null,null,null;route,null,null,null,null;route,null,null,null,null;route,null,null,null,null;startGoal,null,null,null,null', TRUE, 'u;null;mf;1;mf;1;mf;1;mf;1;tr;180;mf;1;mf;1;mf;1;mf;1', TRUE, '0;20;1;1;1;1;0;2;2;2;2', 'zero');

-- センサーコースをID 2 に挿入する
INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point, course_out_rule) VALUES (2, 'センサーコース', 'null,null,null,null,null;null,null,null,null,null;null,null,null,null,null;null,null,null,null,null;start,route,route,route,goal', TRUE, 'r;r;mf;2;ps;0;mf;2;ps;0', TRUE, '0;0;0;10;0;(10,3,5,20,-5)', 'keep');

-- testJudgeをID 1 に挿入する
INSERT INTO judge (id, name) VALUES (1, 'TestJudge');

-- シーケンスをリセット
SELECT setval('course_id_seq', (SELECT COALESCE(MAX(id), 0) FROM course));
