-- ユーザー名とハッシュ化されたパスワードを挿入する

INSERT INTO users (id, name, password) VALUES (1, 'USER_NAME', 'HASHED_PASSWORD');

-- THE 一本橋のコースをID -1 に挿入する

INSERT INTO course (id, name, field, fieldvalid, mission, missionvalid, point) VALUES (-1, 'THE IpponBashi', 'route;route;route;route;start', TRUE, 'u;null;mf;1;mf;1;mf;1;mf;1;tr;180;mf;1;mf;1;mf;1;mf;1', TRUE, '0;20;1;1;1;1;0;2;2;2;2');

-- センサーコースをID -2 に挿入する

INSERT INTO course (id, name, fieldvalid, missionvalid) VALUES (-2, 'SensorCourse', TRUE, TRUE);

-- testUmpireをID 1 に挿入する

INSERT INTO umpire (id, name) VALUES (1, 'TestUmpire');