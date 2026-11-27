INSERT INTO settings (key, value) VALUES
  ('platform_name', 'مدار'),
  ('accent_color', '#3d8bff'),
  ('hero_tagline', 'الرياضيات مش حفظ… فهم. من الصفر لحد الامتحان.'),
  ('instapay_handle', 'madar@instapay'),
  ('wallet_number', '01000000000'),
  ('support_whatsapp', '201000000000'),
  ('default_term_price', '1200'),
  ('payment_note', 'بعد التحويل ارفع صورة الإيصال هنا. الاعتماد بيتم يدويًا في خلال ٢٤ ساعة.')
ON CONFLICT (key) DO NOTHING;
--> statement-breakpoint
INSERT INTO courses (slug, title, stage, grade_key, track, pathway, math_level, description, price_egp, duration_months, is_published, sort_order) VALUES
  ('prep-1-term-1', 'الرياضيات — أولى إعدادي — الترم الأول', 'prep', 'prep-1', 'general', NULL, 'standard', 'الأعداد النسبية، الجبر، والهندسة من الأساس. كل درس بيبني على اللي قبله، وكل قاعدة ليها سبب.', 900, 3, true, 10),
  ('prep-2-term-1', 'الرياضيات — تانية إعدادي — الترم الأول', 'prep', 'prep-2', 'general', NULL, 'standard', 'الجذور التربيعية، النسبة والتناسب، والمساحات. شرح مبني على الفهم مش الحفظ.', 900, 3, true, 20),
  ('prep-3-term-1', 'الرياضيات — تالتة إعدادي — الترم الأول', 'prep', 'prep-3', 'general', NULL, 'standard', 'العلاقات والدوال، والهندسة التحليلية الأولى. الكورس اللي بيحدد مستواك في أولى ثانوي.', 1000, 3, true, 30),
  ('sec-1-term-1', 'الرياضيات — أولى ثانوي — الترم الأول', 'secondary', 'sec-1', 'general', NULL, 'standard', 'الجبر وحساب المثلثات من الصفر. تأسيس كامل قبل التخصص.', 1200, 3, true, 40),
  ('sec-2-term-1', 'الرياضيات — تانية ثانوي (علمي) — الترم الأول', 'secondary', 'sec-2', 'general', NULL, 'advanced', 'الدوال، النهايات، والهندسة الفراغية. مستوى متقدم لعلمي رياضة.', 1400, 3, true, 50),
  ('sec-3-term-1', 'الرياضيات — تالتة ثانوي (علمي) — الترم الأول', 'secondary', 'sec-3', 'general', NULL, 'advanced', 'التفاضل والتكامل والاستاتيكا. منهج الثانوية العامة كامل بترتيب الكتاب.', 1600, 3, true, 60),
  ('bacc-math-1', 'الرياضيات — البكالوريا — مسار الرياضيات — المستوى الأول', 'secondary', 'sec-1', 'baccalaureate', 'math', 'advanced', 'منهج البكالوريا المصرية الجديد — مسار الرياضيات. جبر، تحليل، وهندسة بمنطق المسار.', 1500, 3, true, 70),
  ('bacc-science-1', 'الرياضيات — البكالوريا — مسار العلوم — المستوى الأول', 'secondary', 'sec-1', 'baccalaureate', 'science', 'standard', 'الرياضيات المطلوبة لمسار العلوم في البكالوريا — تطبيقات وأدوات أساسية.', 1300, 3, true, 80)
ON CONFLICT (slug) DO NOTHING;
