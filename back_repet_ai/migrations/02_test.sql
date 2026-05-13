-- 1. Добавляем темы ОГЭ
INSERT INTO topics (code, title) VALUES 
('OGE_MATH_1', 'Планы участков (задания 1-5)'),
('OGE_MATH_15', 'Геометрия: Треугольники');

-- 2. Добавляем задачи разной сложности
INSERT INTO tasks (topic_code, content, correct_answer, difficulty) VALUES 
('OGE_MATH_1', 'Найдите площадь жилого дома на плане. Ответ дайте в кв.м.', '36', 1),
('OGE_MATH_1', 'Найдите расстояние от жилого дома до гаража по прямой.', '15', 2),
('OGE_MATH_15', 'В треугольнике ABC угол C равен 90, AC=6, BC=8. Найдите AB.', '10', 1),
('OGE_MATH_15', 'В равнобедренном треугольнике боковая сторона равна 13, а основание 10. Найдите площадь.', '60', 2);

-- 3. Добавляем тестового пользователя (пароль 'secret', захеширован)
INSERT INTO users (login, password_hash) VALUES 
('student1', '$2a$10$XgE6tXzE9pS9wB8YuxyGxeSg0S7bZEx5M2Ld8rWe8rWe8rWe8rWe.');

-- 4. Записываем стартовый прогресс для этого пользователя
INSERT INTO user_progress (user_id, topic_code, level) VALUES 
(1, 'OGE_MATH_1', 1),
(1, 'OGE_MATH_15', 2);
