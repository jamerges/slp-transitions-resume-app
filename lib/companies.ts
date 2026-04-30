export interface Company {
  name: string;
  url: string;
  note: string;
  roles: string[];
  categories: string[];
}

export interface ScoredCompany extends Company {
  _score: number;
  _matchReasons: string[];
}

export interface TransitionStory {
  name: string;
  from: string;
  to: string;
  setting: string;
  quote: string;
  tags: string[];
}

export const COMPANIES_DB: Company[] = [
  {"name": "Talkiatry", "url": "talkiatry.com", "note": "Telepractice for Psychiatrists", "roles": ["Content"], "categories": ["HealthTech"]},
  {"name": "Expressable", "url": "expressable.io", "note": "Telepractice for SLPs", "roles": ["Content"], "categories": ["HealthTech", "SLP-Adjacent"]},
  {"name": "Incredible Health", "url": "incrediblehealth.com", "note": "Healhcare recrutiment for RNs", "roles": ["Content"], "categories": ["Recruiting"]},
  {"name": "Hinge Health", "url": "hingehealth.com", "note": "Hinge Health is building the world’s most patient-centered Digital Musculoskeletal (MSK) Clinic", "roles": ["Content"], "categories": ["HealthTech"]},
  {"name": "BetterUp", "url": "betterup.com", "note": "Coaching for executives", "roles": ["Coaching", "Content", "Research"], "categories": ["Coaching", "EdTech", "HealthTech"]},
  {"name": "Teladoc", "url": "teladochealth.com", "note": "Teladoc Health is transforming how people access and experience healthcare. Recognized as the world leader in virtual care, we are partnering with over a thousand clients to serve hundreds of...", "roles": ["Content"], "categories": ["HealthTech"]},
  {"name": "Pearl Heatlh", "url": "pearlhealth.com", "note": "Tools to help physicians have more autonomy", "roles": ["Content"], "categories": ["HealthTech"]},
  {"name": "Parsley Health", "url": "parsleyhealth.com", "note": "On a mission to transform the health of everyone, everywhere through the world’s best possible medicine.", "roles": ["Customer Success"], "categories": ["HealthTech"]},
  {"name": "Kind Body", "url": "kindbody.com", "note": "Holistic women's health, fertility, and family-building care – for all.", "roles": ["Customer Success", "Operations"], "categories": ["HealthTech"]},
  {"name": "Maven Clinic", "url": "mavenclinic.com", "note": "Largest virtual clinic for fertility, pregnancy, and parenting.", "roles": ["Content", "Customer Success", "Marketing", "Operations", "Sales"], "categories": ["HealthTech"]},
  {"name": "ginger", "url": "ginger.com", "note": "On-demand mental health", "roles": ["Content", "Customer Success", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Sales"], "categories": ["HealthTech"]},
  {"name": "Calm", "url": "Calm.com", "note": "Mediation app\n\nFind Your Calm\n\nOur goal is to help you improve your health and happiness.", "roles": ["Content", "Marketing"], "categories": ["HealthTech"]},
  {"name": "Noom", "url": "Noom.com", "note": "Noom is the world's leading behavior change company, disrupting the weight loss and healthcare industries. By combining the power of artificial intelligence, mobile tech, and psychology with the...", "roles": ["Content", "Research"], "categories": ["Coaching", "EdTech", "HealthTech"]},
  {"name": "Health Union", "url": "health-union.com", "note": "Health Union brings people impacted by chronic illnesses together through condition-specific online health communities.", "roles": ["Content", "Marketing", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Legacy Health", "url": "legacyhealth.org", "note": "Making life better for our patients, our community, and each other is more than just our purpose, it's our legacy.", "roles": ["Customer Success", "Operations", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Mine'd", "url": "doyoumined.com", "note": "Mine’d is a modern solution for self-help allowing users to interact with top emotional wellness experts as well as each other through live and on", "roles": ["Coaching", "Content", "Marketing"], "categories": ["EdTech", "HealthTech"]},
  {"name": "Modern Age", "url": "modern-age.com", "note": "Building the first comprehensive aging wellness platform to help you feel good and age well — inside and out.", "roles": ["Coaching", "Content", "Recruiting/HR", "Research"], "categories": ["HealthTech"]},
  {"name": "study", "url": "study.com", "note": "We make learning & professional skills development flexible, affordable & engaging for millions of users each month.", "roles": ["Content"], "categories": ["EdTech"]},
  {"name": "Jumo Health", "url": "jumohealth.com", "note": "At Jumo Health, we provide award-winning educational content and tools to help children and families understand, manage, and own their health. Our age-appropriate comic books, podcasts, videos, and...", "roles": ["Marketing"], "categories": ["EdTech", "HealthTech"]},
  {"name": "Big Health", "url": "bighealth.com", "note": "Big Health’s mission is to help millions back to good mental health by providing safe and effective non-drug alternatives for the most common mental health conditions including insomnia and anxiety.", "roles": ["Marketing", "Operations", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "supercharged", "url": "iamsupercharged.com", "note": "SUPERCHARGED powers your personal development. You go beyond inspiration and you start taking action through our community, events, media and experiences.", "roles": ["Content"], "categories": ["Coaching", "EdTech"]},
  {"name": "Aidoc Medical", "url": "aidoc.com", "note": "Transforming the world of healthcare with AI solutions to improve physician workflows and patient outcomes.", "roles": ["Customer Success", "Marketing", "Operations", "Research"], "categories": ["HealthTech"]},
  {"name": "Tomorrow Health", "url": "home.tomorrowhealth.com", "note": "At Tomorrow Health, we believe patients deserve an exceptional experience for care at home. That’s why we’re bringing together personal service and modern technology to simplify home-based care,...", "roles": ["Content", "Marketing", "Operations", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Wildflower Health", "url": "wildflowerhealth.com", "note": "Wildflower connects women and families to better care by breaking down silos among providers, payer and best-in-class partners.", "roles": ["Coaching", "Content"], "categories": ["HealthTech"]},
  {"name": "Mango Health", "url": "mangohealth.com", "note": "Modern Patient Support For Specialty Medications", "roles": [], "categories": ["HealthTech"]},
  {"name": "Folx Health", "url": "folxhealth.com", "note": "the leading Telehealth company that gives the LGBTQIA+ community access to quality care that’s in service of our needs and in celebration of our lives.⁠", "roles": [], "categories": ["HealthTech"]},
  {"name": "Plume Health", "url": "getplume.co", "note": "Gender-affirming care, from your phone.", "roles": [], "categories": ["HealthTech"]},
  {"name": "Buoy Health", "url": "buoyhealth.com", "note": "Buoy is a Boston-based digital health company that uses AI technology to provide personalized clinical support the moment an individual has a health concern.", "roles": [], "categories": ["HealthTech"]},
  {"name": "Kaia Health", "url": "kaiahealth.com", "note": "multimodal rehabilitation, a holistic approach to managing chronic conditions. Our users have easy access via smartphone and tablet to our programs for back/hip/knee pain and COPD using this...", "roles": ["Content", "Engineering", "Marketing", "Operations"], "categories": ["HealthTech"]},
  {"name": "Able To", "url": "ableto.com", "note": "AbleTo is the pioneering provider of high-quality behavioral health care—delivered virtually from the comfort, privacy, and convenience of your home.", "roles": ["Coaching"], "categories": ["HealthTech"]},
  {"name": "Lyra Health", "url": "lyrahealth.com", "note": "Transforming behavioral health through technology with a human touch", "roles": ["Content", "Customer Success", "Marketing", "Operations"], "categories": ["HealthTech"]},
  {"name": "Baysein Health", "url": "bayesianhealth.com", "note": "Bayesian’s AI platform activates state-of-the-art AI within the electronic medical record (EMR) to deliver accurate and actionable clinical signals that catch life-threatening events early, resulting...", "roles": ["Customer Success", "Marketing"], "categories": ["HealthTech"]},
  {"name": "Taro Heatlh", "url": "tarohealth.com", "note": "Our Individual and Family ACA health insurance plans give you health care without the headache — coming November 2022 to Maine!", "roles": ["Operations"], "categories": ["HealthTech"]},
  {"name": "Medcase", "url": "medcase.health", "note": "Welcome to medcase, the global marketplace for clinicians and healthcare data. Signup today.", "roles": ["Engineering", "Product"], "categories": ["HealthTech"]},
  {"name": "Mindbloom", "url": "mindbloom.com", "note": "Meds, talk therapy, or self-care not quite getting you there? Achieve your breakthrough with clinician-prescribed, guided experiences to help combat anxiety or depression.", "roles": ["Marketing", "Operations", "Product"], "categories": ["HealthTech"]},
  {"name": "Redesign Health", "url": "redesignhealth.com", "note": "We elevate healthcare companies that empower people to live their healthiest lives.", "roles": ["Coaching", "Engineering", "Marketing", "Operations", "Sales"], "categories": ["Coaching", "HealthTech"]},
  {"name": "Centaur Labs", "url": "centaurlabs.com", "note": "Your medical AI is only as good as the data it’s trained on. Build life-saving technology with accurate medical data labeling you can trust.", "roles": ["Engineering", "Marketing", "Sales"], "categories": ["HealthTech"]},
  {"name": "Canvas Medical", "url": "canvasmedical.com", "note": "EMR and payments platform for healthcare", "roles": ["Customer Success", "Engineering", "Product", "Sales"], "categories": ["HealthTech"]},
  {"name": "Geode Health", "url": "geodehealth.com", "note": "Welcome to Geode Health\n\nWe are a mental health company focused on you.\nTreatment options are often hard to find, difficult to schedule, out-of-pocket and increasingly only available via...", "roles": ["Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Light Matter", "url": "lightmatter.com", "note": "We build ambitious digital health products.\n\nLightmatter is a team of designers, developers, and strategists that build software applications to help the world's most promising health companies...", "roles": ["Content", "Marketing", "Product"], "categories": ["HealthTech"]},
  {"name": "Songbird Therapy", "url": "songbirdcare.com", "note": "Life-changing autism care in weeks, not months.\n\nSongbird Therapy is a modern provider of in-home Applied Behavior Analysis (ABA) — our best-in-class therapists come to you.", "roles": ["Customer Success", "Marketing", "Operations", "Product"], "categories": ["SLP-Adjacent"]},
  {"name": "Recora Health", "url": "recorahealth.com", "note": "Whole person cardiac recovery.\n\nRecora helps people recover confidence, community, and motivation following a cardiac event through coaching, guided exercise, and personalized care.", "roles": ["Engineering"], "categories": ["HealthTech"]},
  {"name": "Memora Health", "url": "memorahealth.com", "note": "A Smart Operating System for Healthcare\nMeet Patients Where They Are", "roles": ["Engineering", "Marketing", "Product", "Research"], "categories": ["HealthTech"]},
  {"name": "United Healthcare", "url": "uhc.com", "note": "Get health plans for you and your family, at every age and stage", "roles": ["Customer Success", "Marketing", "Operations", "Sales"], "categories": ["HealthTech"]},
  {"name": "Juli", "url": "juli.co", "note": "Live better with juli\n\nThe power of Artificial Intelligence combined\nwith a friendly personal health assistant \nwho is available to you 24/7? Sign me up!", "roles": ["Engineering", "Marketing"], "categories": ["HealthTech"]},
  {"name": "Origin", "url": "theoriginway.com", "note": "PHYSICAL THERAPY FOR\nYOUR PELVIC FLOOR & WHOLE BODY\n\nVirtual and in-person visits for pregnancy, postpartum, menopause, and more!", "roles": ["Customer Success", "Engineering", "Operations"], "categories": ["HealthTech"]},
  {"name": "Carta Healthcare", "url": "carta.healthcare", "note": "Make all your healthcare data actionable.\n\nOur industry-leading, artificial intelligence (AI)–driven technology converts both structured and unstructured healthcare data into a high-quality,...", "roles": ["Engineering", "Marketing", "Operations", "Sales"], "categories": ["HealthTech"]},
  {"name": "Zus Health", "url": "zushealth.com", "note": "Reversing the curse of\nhealth data isolation\n\nZus empowers an entirely new wave of healthcare builders to create technologies and services without the usual blockers", "roles": ["Engineering", "Product", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "BehaVR", "url": "behavr.com", "note": "We leverage the unmatched therapeutic powers of Virtual Reality to help people get connected, get treated and get better.", "roles": ["Product"], "categories": ["Tech"]},
  {"name": "Decent", "url": "decent.com", "note": "Payroll & Benefits Better together.", "roles": ["Product"], "categories": ["HealthTech"]},
  {"name": "Turquoise", "url": "turquoise.health", "note": "Compare\nprices before\nyou get care.\n\nStarting this year, all hospitals are required to list their prices for\nelective services. Whether you have insurance or plan to pay cash -\nfind and compare...", "roles": ["Engineering", "Product"], "categories": ["HealthTech"]},
  {"name": "Speakeasy Inc.", "url": "speakeasyinc.com", "note": "Our Work is Drawing Out the Best of Who You Are\n\nFor over 47 years Speakeasy has worked with thousands of executives and teams from startups to Fortune 500 companies developing their communication...", "roles": ["Coaching", "Customer Success", "Sales"], "categories": ["SLP-Adjacent"]},
  {"name": "Great Minds", "url": "greatminds.org", "note": "What began as a small group of K-12 advocates with a passion for knowledge has grown quickly into teams of hundreds of teacher-writers on a mission to elevate education in every classroom. \nGreat...", "roles": ["Content", "Customer Success", "Engineering", "Marketing", "Operations"], "categories": ["EdTech"]},
  {"name": "Nagwa", "url": "nagwa.com/en", "note": "Learn and get access to an online educational platform with achievement-boosting analytical tools, a brilliant virtual classroom, and an ever-expanding set of outstanding learning resources.", "roles": ["Content", "Customer Success", "Marketing", "Operations"], "categories": ["EdTech"]},
  {"name": "Duarte", "url": "duarte.com", "note": "Your presentations are the best opportunity to tell your story and inspire people to act. \n\nAt Duarte we help you write, design, and deliver groundbreaking stories and visual presentations for every...", "roles": ["Coaching", "Marketing"], "categories": ["Coaching", "SLP-Adjacent"]},
  {"name": "Wiley", "url": "wiley.com/en-us", "note": "College, career and everything in between—never stop learning.\n\nOur books cover a wide range of topics, from accounting to technology. Explore new subjects and skills today.", "roles": ["Coaching", "Content", "Customer Success", "Marketing", "Operations", "Recruiting/HR"], "categories": ["EdTech"]},
  {"name": "Outschool", "url": "outschool.com", "note": "Over 140,000 Interactive Online Classes\nKeep kids ages 3-18 engaged with thousands of classes and camps on the topics they're most passionate about!", "roles": ["Community", "Customer Success", "Research"], "categories": ["EdTech"]},
  {"name": "AIDS Healthcare Founcation", "url": "aidshealth.org", "note": "AIDS HEALTHCARE FOUNDATION:\nCUTTING EDGE MEDICINE AND ADVOCACY REGARDLESS OF ABILITY TO PAY", "roles": ["Content", "Customer Success", "Marketing", "Operations"], "categories": ["Nonprofit"]},
  {"name": "International Education Corporation", "url": "ieccolleges.com", "note": "At International Education Corporation (IEC), we understand the transformative power of education and its ability to nurture opportunities, change lives, and help students achieve their dreams. \n\nAs...", "roles": ["Content", "Teaching"], "categories": ["EdTech"]},
  {"name": "Go Guardian", "url": "goguardian.com", "note": "More effective, engaging learning — from anywhere.\n\nGoGuardian powers K-12 digital learning environments where every student can thrive.", "roles": ["Content", "Customer Success", "Engineering", "Marketing", "Operations", "Product", "Sales"], "categories": ["EdTech"]},
  {"name": "Duo Health", "url": "duohealth.com", "note": "Duo Health is a new type of medical group designed around the needs of patients with chronic kidney disease & kidney failure and their physicians.", "roles": ["Content", "Product"], "categories": ["HealthTech"]},
  {"name": "Brain FX", "url": "brainfx.com", "note": "Measure Milder Cognitive Dysfunction and Plan More Targeted Care\n\nFocus on what matters most and deliver better patient outcomes, faster.\nSpecifically designed to detect what other cognitive tests...", "roles": [], "categories": ["HealthTech"]},
  {"name": "NeuroCatch", "url": "neurocatch.com", "note": "OBJECTIVE\nCOGNITIVE\nEVALUATION\n\nThe NeuroCatch® Platform is an industry-leading medical device that offers\nan objective evaluation of cognitive function, which is delivered in minutes at the point of...", "roles": [], "categories": ["HealthTech"]},
  {"name": "Cognixion", "url": "cognixion.com", "note": "Cognixion is a mission-driven company, aiming to unlock speech for hundreds of millions of people worldwide affected by communication disabilities. \n\nBy providing affordable and accessible...", "roles": [], "categories": ["HealthTech"]},
  {"name": "ABI Wellness", "url": "abiwellness.com", "note": "A Higher Standard of Cognitive Care\n\nWhen it comes to cognitive rehabilitation, the ability to serve more people effectively is invaluable and critical. That’s why we’ve developed our proprietary...", "roles": [], "categories": ["HealthTech"]},
  {"name": "Blueprint Health", "url": "blueprint-health.com", "note": "Deliver excellent mental healthcare.\n\nBlueprint helps clinicians enhance client outcomes through the power and promise of digital measurement-based care.\n\nTour the product", "roles": [], "categories": ["HealthTech"]},
  {"name": "A Cloud Guru", "url": "acloudguru.com/careers", "note": "Cloud is the future and we're here to send as many into that future as we can. \n\nOur name may sound a bit funny, but we believe people can seriously change their lives by learning new skills. \n\nWe...", "roles": ["Content", "Engineering", "Marketing", "Product"], "categories": ["EdTech"]},
  {"name": "Everspring", "url": "everspringpartners.com", "note": "Higher education has gone digital. Now what?\n\nEverspring builds online and hybrid courses that deliver engagement free from traditional constraints. \nAccelerating your mission is ours. Whether you...", "roles": ["Engineering", "Marketing", "Operations"], "categories": ["EdTech"]},
  {"name": "Bright Health", "url": "builtin.com/company/bright-health/jobs", "note": "Bright Health is a new health insurance company using technology to provide better outcomes for all.\n\nBright Health Group is defining the future of health care by integrating financing, care delivery...", "roles": ["Marketing", "Operations", "Product", "Project Management"], "categories": ["HealthTech", "Tech"]},
  {"name": "Rightway", "url": "rightwayhealthcare.com", "note": "Our care navigation and pharmacy benefits management solutions are delivered through a consumer-centric app that pairs every member with a live, clinician-led care team. \n\nBy combining expert, human...", "roles": ["Data", "Operations", "Product", "Recruiting/HR"], "categories": ["HealthTech", "Tech"]},
  {"name": "Assurance", "url": "assurance.com", "note": "ASSURANCE is a technology start-up passionately improving the personal insurance industry. \n\nWe're enhancing consumer outcomes and reducing friction through world-class Data Science, Engineering,...", "roles": ["Content", "Data", "Engineering", "Operations", "Product", "Project Management", "Research", "Sales"], "categories": ["HealthTech", "Tech"]},
  {"name": "Patient Pop", "url": "patientpop.com/careers", "note": "PatientPop is a healthcare technology company that helps practices thrive.\n\nPatientPop is a rapidly-growing start-up in the heart of Silicon Beach. Our office knows how to play, and we’re also...", "roles": ["Design", "Operations", "Project Management"], "categories": ["HealthTech", "Tech"]},
  {"name": "Covera Health", "url": "coverahealth.com", "note": "Change the diagnosis.\n\nChange their world.\n\nCovera Health is pioneering advanced clinical analytics to reduce misdiagnoses and connect patients with the right care from the start.", "roles": ["Engineering", "Operations", "Product", "Project Management"], "categories": ["HealthTech"]},
  {"name": "Amplify", "url": "amplify.com", "note": "A pioneer in K–12 education, Amplify is leading the way in next-generation curriculum and formative assessment.\n\nAmplify is a publisher of high-quality K-12 curriculum and assessments. We are...", "roles": ["Data", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Recruiting/HR", "Research", "Sales"], "categories": ["EdTech"]},
  {"name": "Panorama Education", "url": "panoramaed.com", "note": "Panorama Education is a fast growing startup that helps educators understand how students are doing across academics, attendance, behavior, and college readiness, and then plan for action to support...", "roles": ["Content", "Customer Success", "Data", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Recruiting/HR", "Research", "Sales"], "categories": ["EdTech", "Tech"]},
  {"name": "Headway", "url": "headway.co", "note": "Headway is building a new mental healthcare system, rewired for access and affordability.\n\nWe all know someone that has struggled with mental health - 1 in 4 people have a treatable mental health...", "roles": ["Data", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Sales"], "categories": ["HealthTech"]},
  {"name": "Well Health", "url": "wellapp.com", "note": "WELL offers bi-directional texting to connect patients and providers throughout the care journey.\n\nOur Mission: Make healthcare the gold standard in customer service.\n\nWhat We Deliver: WELL ™️ Health...", "roles": ["Data", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Sales"], "categories": ["HealthTech"]},
  {"name": "Screencastify", "url": "screencastify.com", "note": "he world's most popular classroom video solution.\n\nScreencastify is the #1 screen recorder for Chrome. In 2020, Screencastify became K-12’s most used asynchronous video tool with more than 15 million...", "roles": ["Design", "Engineering", "Marketing", "Operations", "Product", "Recruiting/HR", "Sales"], "categories": ["EdTech", "Tech"]},
  {"name": "Oak Street Health", "url": "oakstreethealth.com", "note": "Oak Street Health is a network of neighborhood primary care centers. We operate an innovative model that drives patient engagement, improves health outcomes, and manages medical costs in the older...", "roles": ["Customer Success", "Data", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Sales"], "categories": ["HealthTech"]},
  {"name": "Thirty Madison", "url": "thirtymadison.com", "note": "Thirty Madison is building the premier healthcare company for people living with chronic conditions.\n\nThirty Madison is building the premier healthcare company for people with chronic health issues....", "roles": ["Data", "Engineering", "Marketing", "Operations", "Project Management"], "categories": ["HealthTech", "e-commerce"]},
  {"name": "Teachable", "url": "teachable.com", "note": "Teachable empowers creators and independent business owners to turn their unique expertise into profit by creating and selling online courses. Our reach is proven: As of 2020, more than 23 million...", "roles": ["Design", "Marketing", "Product"], "categories": ["EdTech", "e-commerce"]},
  {"name": "Teacher Pay Teachers", "url": "teacherspayteachers.com", "note": "TpT is the world's most popular online marketplace for original educational resources. More than 85% of U.S. teachers come to TpT to access over 5 million resources for all aspects of PreK-12...", "roles": ["Content", "Marketing", "Operations", "Product", "Sales"], "categories": ["EdTech", "e-commerce"]},
  {"name": "Handshake", "url": "joinhandshake.com", "note": "Handshake is the number one site for college students to find a job.\n\nWe are thrilled to announce Handshake’s $200M Series F funding round. At Handshake, we believe that a career opportunity...", "roles": ["Content", "Design", "Engineering", "Marketing", "Operations", "Product", "Project Management", "Research", "Sales"], "categories": ["EdTech"]},
  {"name": "Scale Media", "url": "scalemedia.com", "note": "Scale is a high growth, tech-driven company that builds next generation health and wellness DTC brands, smarter. Our full-stack omni-channel ecosystem is powered by technology using proprietary...", "roles": ["Marketing", "Operations"], "categories": ["HealthTech", "digital media", "e-commerce"]},
  {"name": "Skillshare", "url": "skillshare.com", "note": "Skillshare is an online learning community with thousands of inspiring classes for creative and curious people, on topics including illustration, design, photography, video, freelancing, and more. On...", "roles": ["Content", "Data", "Engineering", "Sales"], "categories": ["EdTech"]},
  {"name": "Silvertree", "url": "silvertree.io", "note": "Silvertree is on a mission to empower the world’s aging population. We are developing a wellness wearable platform that provides the right balance of safety, connection, and style for active older...", "roles": ["Engineering", "Marketing", "Product"], "categories": ["HealthTech"]},
  {"name": "Classkick", "url": "classkick.com", "note": "he digital notebook app making effective teaching faster and easier. Built for in-person, online, or blended learning.\n\nEveryday, kids come to class feeling engaged, supported and excited to learn...", "roles": ["Data", "Product", "Sales"], "categories": ["EdTech", "Tech"]},
  {"name": "Talkspace", "url": "talkspace.com", "note": "Talkspace is the world's leading online therapy company. Talkspace has been used by more than one million people, and we have 2000+ therapists on our platform. We're on a mission to make quality,...", "roles": ["Design", "Marketing", "Operations", "Product", "Sales"], "categories": ["HealthTech"]},
  {"name": "Quartet Health", "url": "quartethealth.com", "note": "We connect primary care and mental health providers to get people the right care, at the right time.\n\nOur mission is to improve the lives of people with mental health conditions through technology...", "roles": ["Data", "Operations", "Product", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Iterative Scopes", "url": "iterativescopes.com", "note": "terative Scopes is a pioneer in the application of artificial intelligence-based precision medicine to gastroenterology with the aim of establishing a new standard of care for the detection, and...", "roles": ["Customer Success", "Data", "Engineering", "Marketing", "Operations", "Product", "Project Management"], "categories": ["HealthTech"]},
  {"name": "Path Mental Health", "url": "pathmentalhealth.com", "note": "Easily match with the right therapist that's covered by your insurance\nAffordable online therapy anytime, anywhere. Get started today with a free consultation.", "roles": ["Content", "Customer Success", "Engineering", "Operations", "Project Management"], "categories": ["HealthTech"]},
  {"name": "Seesaw", "url": "web.seesaw.me", "note": "Seesaw is a learning platform that brings educators, students and families together to deepen student learning. \n\nTeachers design and facilitate powerful learning experiences, students create,...", "roles": ["Data", "Engineering", "Marketing", "Operations", "Recruiting/HR", "Sales"], "categories": ["EdTech"]},
  {"name": "BenchPrep", "url": "benchprep.com", "note": "BenchPrep helps the world's leading education, training, and assessment companies build and deliver best-in-class online learning programs. Customers include ACT, Becker Professional Education, AAMC,...", "roles": ["Content", "Design", "Engineering", "Marketing", "Operations", "Product", "Recruiting/HR", "Sales"], "categories": ["EdTech"]},
  {"name": "Lively", "url": "listenlively.com", "note": "Creating a best-in-class experience to help solve one of America's greatest healthcare issues — untreated hearing loss.\n\nWe’re revolutionizing hearing care. We’re on a mission to empower tens of...", "roles": ["Operations", "Product", "Recruiting/HR"], "categories": ["HealthTech", "SLP-Adjacent"]},
  {"name": "WHOOP", "url": "whoop.com", "note": "At WHOOP, we’re on a mission to unlock human performance. WHOOP empowers members to perform at a higher level through a deeper understanding of their bodies and daily lives. \n\nOur wearable device and...", "roles": ["Content", "Design", "Marketing", "Operations", "Product", "Recruiting/HR", "Sales"], "categories": ["HealthTech"]},
  {"name": "Simple Practice", "url": "simplepractice.com", "note": "We build software that matters.\n\nOver 100,000 health and wellness professionals trust us to help them grow and run their practices. Our cloud-based, HIPAA compliant platform offers innovative...", "roles": ["Content", "Data", "Design", "Operations", "Product", "Recruiting/HR", "Sales"], "categories": ["HealthTech", "Tech"]},
  {"name": "Curriculum Associates", "url": "jobs.jobvite.com/curriculumassociates", "note": "Curriculum Associates is an edtech company committed to making classrooms better places.\n\nAt Curriculum Associates, we believe in the potential of every child and are changing the face of education...", "roles": ["Data", "Design", "Marketing", "Product", "Project Management", "Recruiting/HR", "Research", "Sales"], "categories": ["EdTech", "Tech"]},
  {"name": "FindHelp", "url": "company.findhelp.com", "note": "Findhelp connects people in need with the social care programs that serve them at findhelp.org.\n\nWe’re changing the way people connect to social care programs.\n\nFindhelp launched 10 years ago in...", "roles": ["Design", "Engineering", "Operations", "Product", "Recruiting/HR"], "categories": ["HealthTech", "Tech"]},
  {"name": "Propeller", "url": "propellercommunicates.com", "note": "Propeller is an independent digitally-focused healthcare marketing agency with a big 360 promise.\n\nWe creatively navigate the highly regulated landscape to influence the most influential.", "roles": ["Content", "Marketing", "Operations"], "categories": ["healthcare marketing agency"]},
  {"name": "Therapy Brands", "url": "therapybrands.com", "note": "Software solutions for therapists - including billing, scheduling, and more.", "roles": ["Customer Success", "Operations", "Sales"], "categories": ["HealthTech", "Tech"]},
  {"name": "Dreambox Learning", "url": "dreambox.com", "note": "Accelerate learning with proven digital math and reading programs.", "roles": ["Content"], "categories": ["EdTech", "Tech"]},
  {"name": "McGraw Hill", "url": "mheducation.com", "note": "We work to expand the possibilities of content and technology to help millions of educators, learners and professionals around the world achieve success.", "roles": ["Content", "Customer Success", "Design", "Engineering", "Product", "Sales"], "categories": ["EdTech"]},
  {"name": "Avive", "url": "avive.life", "note": "Giving you\nthe power to Save Lives\n\nSudden Cardiac Arrest (SCA) can happen to anyone, anywhere, anytime - your family member at home, your friend at the park, your colleague at work. Avive is...", "roles": ["Content", "Operations"], "categories": ["HealthTech"]},
  {"name": "Nurx", "url": "nurx.com", "note": "Nurx is the most convenient and affordable way to manage your everyday healthcare needs. We believe healthcare is unconditional and everyone should have the freedom to live well, regardless of your...", "roles": ["Engineering", "Marketing", "Operations", "Product"], "categories": ["HealthTech"]},
  {"name": "Reframe", "url": "joinreframeapp.com", "note": "The #1 iOS App for helping people reduce their alcohol intake or quit drinking.\n\nReframe is a neuroscience habit change program focused on helping people change the way alcohol shows up in their...", "roles": ["Content", "Design", "Marketing", "Product"], "categories": ["HealthTech"]},
  {"name": "Better Therepeutics", "url": "bettertx.com", "note": "Pioneering a prescription digital therapeutics platform for treating cardiometabolic diseases\nWe envision a new way to treat diseases like type 2 diabetes and heart disease by targeting the causes,...", "roles": ["Content", "Data", "Product", "Research"], "categories": ["HealthTech"]},
  {"name": "Osmind", "url": "osmind.org", "note": "Welcome to the future of mental health.\n\nElegant, affordable EHR and Outcomes + Engagement Platform designed for treatment-resistant mental health practices. Focus on delivering the best care to your...", "roles": ["Content", "Customer Success", "Product", "Recruiting/HR"], "categories": ["HealthTech"]},
  {"name": "Vida Health", "url": "vida.com", "note": "Vida is a virtual care company that combines a human-centric approach with technology to address chronic and co-occurring physical and behavioral health conditions. \n\nWe provide personalized chronic...", "roles": ["Content", "Customer Success", "Marketing", "Product"], "categories": ["HealthTech"]},
  {"name": "Omada Health", "url": "omadahealth.com", "note": "Omada Health is a virtual-first, integrated care provider. \n\nWe combine the latest clinical protocols with breakthrough behavior science to make it possible for people with chronic conditions to...", "roles": ["Content", "Marketing", "Product", "Research"], "categories": ["HealthTech"]},
  {"name": "Mindbody", "url": "mindbodyonline.com", "note": "Mindbody believes all people, everywhere deserve to realize their most well self. Everything we do—every product, every support call, every line of code—is focused on bringing those moments of...", "roles": ["Content", "Operations"], "categories": ["HealthTech"]},
  {"name": "Ro", "url": "ro.co", "note": "Ro is the healthcare technology company building a patient-centric healthcare system. Ro’s vertically integrated primary care platform powers a personalized, end-to-end healthcare experience from...", "roles": ["Content", "Operations", "Project Management"], "categories": ["HealthTech"]},
  {"name": "HealthCare Recruiters International", "url": "hcrnetwork.com", "note": "Top Healthcare Recruiting and Search Firm", "roles": ["Marketing", "Research"], "categories": ["Recruiting"]},
  {"name": "Premise Health", "url": "premisehealth.com", "note": "We are Premise Health. The world’s leading direct healthcare company and one of the largest digital providers in the country. We operate over 800 wellness centers in 45 states and Guam for more than...", "roles": ["Customer Success", "Operations", "Project Management"], "categories": ["HealthTech", "Recruiting"]},
  {"name": "Athelas", "url": "athelas.com/rpm", "note": "Remote Patient Monitoring (RPM) Programs gather remote health data from your patients, enabling preventative health in the home", "roles": ["Engineering", "Operations", "Sales"], "categories": ["HealthTech"]},
  {"name": "Vinehealth", "url": "We're on a mission to use thoughtful technology to help patients through cancer.", "note": "We're on a mission to use thoughtful technology to help patients through cancer.\n\nWe work with oncologists, specialist cancer nurses and patients to provide an app that allows patients to easily...", "roles": ["Engineering", "Marketing"], "categories": ["HealthTech", "Tech"]},
  {"name": "January AI", "url": "january.ai", "note": "Unlock your unique solution for a healthy metabolism.\n\nJanuary analyzes your blood sugar to help you learn which foods to eat and avoid.", "roles": ["Content", "Marketing", "Product", "Research"], "categories": ["HealthTech"]},
  {"name": "Omada Health", "url": "omadahealth.com", "note": "A virtual-first chronic care provider helping members make lasting changes to improve health and reduce care costs for organizations.", "roles": ["Content", "Marketing", "Operations", "Project Management"], "categories": ["HealthTech"]},
  {"name": "Virta Health", "url": "virtahealth.com", "note": "Blood sugar control without the drugs\n\nOur approach helps people lower blood sugar and lose weight, even while eliminating the need for medications, including insulin.", "roles": ["Coaching", "Customer Success", "Engineering", "Operations", "Project Management"], "categories": ["HealthTech"]},
  {"name": "Docgo", "url": "docgo.com", "note": "DocGo (formerly, Ambulnz) provides on-demand patient transfer between clinical settings and offers in-person medical services or follow-up treatment when a traditional doctor’s appointment isn’t...", "roles": ["Clinical"], "categories": ["HealthTech"]},
  {"name": "Restore Hyper Wellness", "url": "restore.com", "note": "We transformed the wellness space and shattered the ceiling of traditional healthcare by creating a completely new category of wellness. Restore Hyper Wellness delivers expert guidance and the most...", "roles": ["Clinical", "Operations", "Sales"], "categories": ["HealthTech", "wellness"]},
  {"name": "League", "url": "league.com/us", "note": "Powering next-gen healthcare consumer experiences.\n\nBuild on League’s platform to deliver high-engagement, personalized solutions consumers love.", "roles": ["Content", "Marketing", "Operations", "Product"], "categories": ["Tech"]},
  {"name": "AmWell", "url": "business.amwell.com", "note": "Amwell (previously known as American Well) is a leading telehealth platform in the United States and globally, connecting and enabling providers, insurers, patients, and innovators to deliver greater...", "roles": ["Content", "Design", "Engineering", "Marketing", "Recruiting/HR", "Sales"], "categories": ["HealthTech"]},
  {"name": "Elemy", "url": "elemy.com", "note": "Give your child the best support: collaborative, personalized care to help them learn, grow, and reach new milestones (ADHD, ASD, depression, and anxiety platform)", "roles": ["Customer Success", "Engineering", "Operations", "Telehealth"], "categories": ["HealthTech", "SLP-Adjacent"]},
];

export const TRANSITION_STORIES: TransitionStory[] = [
  { name: "Emily H.", from: "Pediatric School SLP", to: "Research Coordinator", setting: "Pediatric neuroscience lab", quote: "I didn't need a new degree. I just needed to show them I already had the skills.", tags: ["Research", "Clinical Research", "Program Management"] },
  { name: "Jon", from: "SLP with Clinical Doctorate", to: "Entertainment Industry PA", setting: "Entertainment law firm", quote: "If you are not happy where you are, move. You are not a tree.", tags: ["Career Change", "Non-traditional", "Quality of Life"] },
  { name: "Former SLP", from: "Medical SLP", to: "EdTech Product Manager", setting: "K-12 EdTech company", quote: "Every IEP meeting was stakeholder management. I just didn't know what to call it.", tags: ["EdTech", "Product Management", "Instructional Design"] },
  { name: "Career Changer", from: "School-based SLP", to: "UX Researcher", setting: "Health tech startup", quote: "I literally interviewed people for a living — turns out that's a job in tech too.", tags: ["UX Research", "HealthTech", "User Research"] },
  { name: "Transitioner", from: "SNF SLP", to: "Customer Success Manager", setting: "SaaS company", quote: "Managing 50 patients with complex needs? That's a client portfolio. Same skills, better hours.", tags: ["Customer Success", "HealthTech", "SaaS"] },
];

export const ROLE_OPTIONS = [
  "EdTech (Product, Sales, Success)", "HealthTech (Customer Success, Implementation)",
  "UX Research", "Instructional Design", "Product Management",
  "Corporate Training / L&D", "Content Strategy / Marketing",
  "Clinical Research / Coordination", "Operations / Program Management",
];

export const NOT_SURE_OPTION = "Not sure yet — help me explore";

export const SETTING_OPTIONS = [
  "School-based (PreK-12)", "Hospital / Acute Care", "Outpatient Clinic",
  "Skilled Nursing / Rehab", "Early Intervention", "Private Practice",
  "University / Research", "Telepractice", "Other",
];

export interface WorkPreference { id: string; label: string; desc: string; }
export const WORK_PREFERENCES: WorkPreference[] = [
  { id: "1on1", label: "1:1 client work", desc: "Deep relationships, personalized care" },
  { id: "data", label: "Data & analysis", desc: "Patterns, metrics, evidence-based decisions" },
  { id: "teaching", label: "Teaching & training", desc: "Helping others learn or grow" },
  { id: "writing", label: "Writing & content", desc: "Documentation, articles, communication" },
  { id: "strategy", label: "Strategy & planning", desc: "Big-picture thinking, problem-solving" },
  { id: "tech", label: "Tech & tools", desc: "Software, AAC devices, telepractice tools" },
  { id: "research", label: "Research & investigation", desc: "Asking questions, finding answers" },
  { id: "leadership", label: "Leadership & mentorship", desc: "Guiding teams, supervising others" },
];

export function getRelevantCompanies(opts: {
  targetRoles: string[];
  settings: string[];
  jobTitle: string;
}): ScoredCompany[] {
  const targetText = opts.targetRoles.join(" ").toLowerCase();
  const titleText = opts.jobTitle.toLowerCase();
  const settingText = opts.settings.join(" ").toLowerCase();
  const allText = targetText + " " + titleText + " " + settingText;

  const roleSignals: Record<string, string[]> = {
    "Customer Success": ["customer success", "account", "care coordinator", "implementation", "onboarding", "client success"],
    "Product": ["product", "edtech (product"],
    "Marketing": ["marketing", "content strategy"],
    "Content": ["content", "writing", "editorial"],
    "Sales": ["sales", "business development"],
    "Research": ["ux research", "research", "user research", "clinical research"],
    "Operations": ["operations", "ops", "program management"],
    "Project Management": ["project management", "program management"],
    "Engineering": ["engineering", "developer"],
    "Design": ["design", "ux", "instructional design"],
    "Coaching": ["coaching", "training", "l&d", "learning and development", "corporate training"],
    "Recruiting/HR": ["recruiting", "talent", "hr", "people ops"],
  };

  const categorySignals: Record<string, string[]> = {
    "EdTech": ["edtech", "ed-tech", "education", "instructional design", "curriculum", "school", "k-12", "higher ed", "e-learning"],
    "HealthTech": ["healthtech", "health-tech", "telehealth", "telepractice", "medical", "clinical", "hospital", "snf", "rehab"],
    "SLP-Adjacent": ["slp", "speech", "language", "audiology", "aac"],
    "Coaching": ["coaching", "wellness"],
    "Recruiting": ["recruiting", "recruitment"],
  };

  const scored: ScoredCompany[] = COMPANIES_DB.map((c) => {
    let score = 0;
    const reasons: string[] = [];

    for (const [role, signals] of Object.entries(roleSignals)) {
      if (c.roles?.includes(role) && signals.some((s) => allText.includes(s))) {
        score += 3;
        reasons.push(role);
      }
    }
    for (const [cat, signals] of Object.entries(categorySignals)) {
      if (c.categories?.includes(cat) && signals.some((s) => allText.includes(s))) {
        score += 2;
      }
    }
    if (c.categories?.includes("SLP-Adjacent")) score += 1;
    if (settingText.includes("school") && c.categories?.includes("EdTech")) score += 1;
    if ((settingText.includes("hospital") || settingText.includes("rehab") || settingText.includes("snf")) && c.categories?.includes("HealthTech")) score += 1;

    return { ...c, _score: score, _matchReasons: reasons };
  });

  const matched = scored.filter((c) => c._score > 0).sort((a, b) => b._score - a._score);

  if (matched.length === 0) {
    return COMPANIES_DB
      .filter((c) => c.categories?.includes("SLP-Adjacent") || c.categories?.includes("HealthTech") || c.categories?.includes("EdTech"))
      .slice(0, 6)
      .map((c) => ({ ...c, _score: 0, _matchReasons: [] }));
  }

  return matched.slice(0, 8);
}

export function getRelevantStories(opts: { targetRoles: string[]; jobTitle: string }): TransitionStory[] {
  const kw = (opts.targetRoles.join(" ") + " " + opts.jobTitle).toLowerCase();
  return TRANSITION_STORIES.filter((s) =>
    s.tags.some((t) => kw.includes(t.toLowerCase())) ||
    s.to.toLowerCase().split(" ").some((w) => kw.includes(w))
  ).slice(0, 3);
}
