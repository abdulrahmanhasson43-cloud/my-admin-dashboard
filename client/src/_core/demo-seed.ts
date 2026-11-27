// Generated from drizzle/migrations/0001_seed_catalog.sql + scripts/seed-lessons.mjs
export const SEED = {
 "courses": [
  {
   "slug": "prep-1-term-1",
   "title": "رياضيات أولى إعدادي",
   "stage": "prep",
   "gradeKey": "prep-1",
   "track": "general",
   "pathway": null,
   "mathLevel": "standard",
   "description": "الأعداد النسبية، الجبر، والهندسة من الأساس. كل درس بيبني على اللي قبله، وكل قاعدة ليها سبب.",
   "priceEgp": 900,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 10
  },
  {
   "slug": "prep-2-term-1",
   "title": "رياضيات تانية إعدادي",
   "stage": "prep",
   "gradeKey": "prep-2",
   "track": "general",
   "pathway": null,
   "mathLevel": "standard",
   "description": "الجذور التربيعية، النسبة والتناسب، والمساحات. شرح مبني على الفهم مش الحفظ.",
   "priceEgp": 900,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 20
  },
  {
   "slug": "prep-3-term-1",
   "title": "رياضيات تالتة إعدادي",
   "stage": "prep",
   "gradeKey": "prep-3",
   "track": "general",
   "pathway": null,
   "mathLevel": "standard",
   "description": "العلاقات والدوال، والهندسة التحليلية الأولى. الكورس اللي بيحدد مستواك في أولى ثانوي.",
   "priceEgp": 1000,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 30
  },
  {
   "slug": "sec-1-term-1",
   "title": "رياضيات أولى ثانوي",
   "stage": "secondary",
   "gradeKey": "sec-1",
   "track": "general",
   "pathway": null,
   "mathLevel": "standard",
   "description": "الجبر وحساب المثلثات من الصفر. تأسيس كامل قبل التخصص.",
   "priceEgp": 1200,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 40
  },
  {
   "slug": "sec-2-term-1",
   "title": "رياضيات تانية ثانوي علمي",
   "stage": "secondary",
   "gradeKey": "sec-2",
   "track": "general",
   "pathway": null,
   "mathLevel": "advanced",
   "description": "الدوال، النهايات، والهندسة الفراغية. مستوى متقدم لعلمي رياضة.",
   "priceEgp": 1400,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 50
  },
  {
   "slug": "sec-3-term-1",
   "title": "رياضيات تالتة ثانوي علمي",
   "stage": "secondary",
   "gradeKey": "sec-3",
   "track": "general",
   "pathway": null,
   "mathLevel": "advanced",
   "description": "التفاضل والتكامل والاستاتيكا. منهج الثانوية العامة كامل بترتيب الكتاب.",
   "priceEgp": 1600,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 60
  },
  {
   "slug": "bacc-math-1",
   "title": "رياضيات البكالوريا · المسار الرياضي",
   "stage": "secondary",
   "gradeKey": "sec-1",
   "track": "baccalaureate",
   "pathway": "math",
   "mathLevel": "advanced",
   "description": "منهج البكالوريا المصرية الجديد — مسار الرياضيات. جبر، تحليل، وهندسة بمنطق المسار.",
   "priceEgp": 1500,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 70
  },
  {
   "slug": "bacc-science-1",
   "title": "رياضيات البكالوريا · المسار العلمي",
   "stage": "secondary",
   "gradeKey": "sec-1",
   "track": "baccalaureate",
   "pathway": "science",
   "mathLevel": "standard",
   "description": "الرياضيات المطلوبة لمسار العلوم في البكالوريا — تطبيقات وأدوات أساسية.",
   "priceEgp": 1300,
   "durationMonths": 3,
   "isPublished": true,
   "sortOrder": 80
  }
 ],
 "PLAN": {
  "prep-1-term-1": {
   "units": [
    "الأعداد النسبية",
    "الجبر",
    "الهندسة"
   ],
   "lessons": [
    [
     "مقدمة في الأعداد النسبية",
     0,
     720,
     true,
     "يعني إيه عدد نسبي، وإزاي نمثّله على خط الأعداد."
    ],
    [
     "الجمع والطرح على الأعداد النسبية",
     0,
     1080,
     false,
     "قواعد الإشارات من غير حفظ — من خط الأعداد."
    ],
    [
     "الضرب والقسمة",
     0,
     960,
     false,
     null
    ],
    [
     "المعادلات من الدرجة الأولى",
     1,
     1260,
     false,
     "حل المعادلة يعني إيه بالظبط."
    ],
    [
     "تطبيقات على المعادلات",
     1,
     900,
     false,
     null
    ],
    [
     "المثلث: زوايا وأضلاع",
     2,
     1140,
     false,
     null
    ],
    [
     "التطابق",
     2,
     1020,
     false,
     null
    ]
   ]
  },
  "prep-2-term-1": {
   "units": [
    "الجذور",
    "التناسب",
    "المساحات"
   ],
   "lessons": [
    [
     "الجذر التربيعي — الفكرة",
     0,
     840,
     true,
     "الجذر مش عملية عكسية بس — ده معنى هندسي."
    ],
    [
     "تبسيط الجذور",
     0,
     1020,
     false,
     null
    ],
    [
     "النسبة والتناسب",
     1,
     900,
     false,
     null
    ],
    [
     "التناسب الطردي والعكسي",
     1,
     1080,
     false,
     null
    ],
    [
     "مساحة الدائرة والقطاع",
     2,
     1200,
     false,
     null
    ]
   ]
  },
  "prep-3-term-1": {
   "units": [
    "العلاقات والدوال",
    "الهندسة التحليلية"
   ],
   "lessons": [
    [
     "العلاقة والدالة — الفرق",
     0,
     960,
     true,
     "كل دالة علاقة، بس مش كل علاقة دالة. ليه؟"
    ],
    [
     "مجال ومدى الدالة",
     0,
     1140,
     false,
     null
    ],
    [
     "الدالة الخطية",
     0,
     1080,
     false,
     null
    ],
    [
     "الإحداثيات والميل",
     1,
     1020,
     false,
     null
    ],
    [
     "معادلة المستقيم",
     1,
     1260,
     false,
     null
    ]
   ]
  },
  "sec-1-term-1": {
   "units": [
    "الجبر",
    "حساب المثلثات"
   ],
   "lessons": [
    [
     "الأعداد المركبة — مقدمة",
     0,
     1080,
     true,
     "ليه محتاجين عدد مربعه سالب؟"
    ],
    [
     "العمليات على الأعداد المركبة",
     0,
     1200,
     false,
     null
    ],
    [
     "المتطابقات المثلثية",
     1,
     1320,
     false,
     null
    ],
    [
     "الدوال المثلثية للزوايا",
     1,
     1140,
     false,
     null
    ]
   ]
  },
  "sec-2-term-1": {
   "units": [
    "الدوال",
    "النهايات",
    "الهندسة الفراغية"
   ],
   "lessons": [
    [
     "مراجعة الدوال",
     0,
     900,
     true,
     null
    ],
    [
     "الدالة الأسية واللوغاريتمية",
     0,
     1380,
     false,
     null
    ],
    [
     "مفهوم النهاية",
     1,
     1200,
     false,
     "النهاية مش قيمة الدالة — ده الفرق اللي بيغيّر كل حاجة."
    ],
    [
     "نظريات النهايات",
     1,
     1260,
     false,
     null
    ],
    [
     "المستقيمات والمستويات في الفضاء",
     2,
     1140,
     false,
     null
    ]
   ]
  },
  "sec-3-term-1": {
   "units": [
    "التفاضل",
    "التكامل",
    "الاستاتيكا"
   ],
   "lessons": [
    [
     "المشتقة — المعنى الهندسي",
     0,
     1260,
     true,
     "المشتقة هي ميل المماس. من هنا كل حاجة بتتبني."
    ],
    [
     "قواعد الاشتقاق",
     0,
     1440,
     false,
     null
    ],
    [
     "تطبيقات المشتقة",
     0,
     1320,
     false,
     null
    ],
    [
     "التكامل غير المحدود",
     1,
     1380,
     false,
     null
    ],
    [
     "التكامل المحدود والمساحات",
     1,
     1500,
     false,
     null
    ],
    [
     "عزم القوة",
     2,
     1080,
     false,
     null
    ]
   ]
  },
  "bacc-math-1": {
   "units": [
    "الجبر",
    "التحليل"
   ],
   "lessons": [
    [
     "مدخل البكالوريا — مسار الرياضيات",
     0,
     780,
     true,
     "الفرق بين منهج البكالوريا والثانوية العامة."
    ],
    [
     "المصفوفات",
     0,
     1260,
     false,
     null
    ],
    [
     "المتتابعات والمتسلسلات",
     1,
     1320,
     false,
     null
    ]
   ]
  },
  "bacc-science-1": {
   "units": [
    "أدوات رياضية"
   ],
   "lessons": [
    [
     "الأدوات الرياضية لمسار العلوم",
     0,
     900,
     true,
     null
    ],
    [
     "النمذجة والتطبيقات",
     0,
     1140,
     false,
     null
    ]
   ]
  }
 }
} as const;
