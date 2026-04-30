import { useState, useEffect, useRef } from "react";

const STEPS = { WELCOME: 0, RESUME: 1, GOALS: 2, JOB: 3, EMAIL: 4, PROCESSING: 5, PREVIEW: 6, FULL_RESULTS: 7, EXPLORE_RESULTS: 8 };

// ─── Company Database (123 companies from SLP Transitions Airtable) ─────
const COMPANIES_DB = [
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

const TRANSITION_STORIES = [
  { name: "Emily H.", from: "Pediatric School SLP", to: "Research Coordinator", setting: "Pediatric neuroscience lab", quote: "I didn't need a new degree. I just needed to show them I already had the skills.", tags: ["Research", "Clinical Research", "Program Management"] },
  { name: "Jon", from: "SLP with Clinical Doctorate", to: "Entertainment Industry PA", setting: "Entertainment law firm", quote: "If you are not happy where you are, move. You are not a tree.", tags: ["Career Change", "Non-traditional", "Quality of Life"] },
  { name: "Former SLP", from: "Medical SLP", to: "EdTech Product Manager", setting: "K-12 EdTech company", quote: "Every IEP meeting was stakeholder management. I just didn't know what to call it.", tags: ["EdTech", "Product Management", "Instructional Design"] },
  { name: "Career Changer", from: "School-based SLP", to: "UX Researcher", setting: "Health tech startup", quote: "I literally interviewed people for a living — turns out that's a job in tech too.", tags: ["UX Research", "HealthTech", "User Research"] },
  { name: "Transitioner", from: "SNF SLP", to: "Customer Success Manager", setting: "SaaS company", quote: "Managing 50 patients with complex needs? That's a client portfolio. Same skills, better hours.", tags: ["Customer Success", "HealthTech", "SaaS"] },
];

const ROLE_OPTIONS = [
  "EdTech (Product, Sales, Success)", "HealthTech (Customer Success, Implementation)",
  "UX Research", "Instructional Design", "Product Management",
  "Corporate Training / L&D", "Content Strategy / Marketing",
  "Clinical Research / Coordination", "Operations / Program Management",
];
const NOT_SURE_OPTION = "Not sure yet — help me explore";

const SETTING_OPTIONS = [
  "School-based (PreK-12)", "Hospital / Acute Care", "Outpatient Clinic",
  "Skilled Nursing / Rehab", "Early Intervention", "Private Practice",
  "University / Research", "Telepractice", "Other",
];

const WORK_PREFERENCES = [
  { id: "1on1", label: "1:1 client work", desc: "Deep relationships, personalized care" },
  { id: "data", label: "Data & analysis", desc: "Patterns, metrics, evidence-based decisions" },
  { id: "teaching", label: "Teaching & training", desc: "Helping others learn or grow" },
  { id: "writing", label: "Writing & content", desc: "Documentation, articles, communication" },
  { id: "strategy", label: "Strategy & planning", desc: "Big-picture thinking, problem-solving" },
  { id: "tech", label: "Tech & tools", desc: "Software, AAC devices, telepractice tools" },
  { id: "research", label: "Research & investigation", desc: "Asking questions, finding answers" },
  { id: "leadership", label: "Leadership & mentorship", desc: "Guiding teams, supervising others" },
];

const SLP_SYSTEM_PROMPT = `You are an expert career transition coach specializing in helping Speech-Language Pathologists (SLPs) pivot to non-clinical careers. You combine deep clinical knowledge with hiring expertise across edtech, healthtech, UX research, instructional design, customer success, product management, and corporate training.

## SKILL TRANSLATION FRAMEWORK
| SLP Skill | Market Translation |
|---|---|
| IEP management | Cross-functional stakeholder coordination |
| Caseload management (30-80+ students) | Project/program management at scale |
| Therapy planning & goal writing | Instructional design & learning outcome development |
| AAC device trials & selection | Product evaluation & technology implementation |
| Parent/teacher communication | Client relationship management & stakeholder communication |
| Progress monitoring & data collection | Data-driven decision making & outcomes tracking |
| Differential diagnosis | Analytical problem-solving & needs assessment |
| Evidence-based practice | Research synthesis & knowledge translation |
| Behavior management | Change management & user engagement strategies |
| Medicaid/insurance documentation | Regulatory compliance & technical documentation |
| Interdisciplinary team collaboration | Cross-functional team leadership |
| Student/patient advocacy | User advocacy & customer success |
| Clinical supervision of CFYs | Team mentorship & professional development |
| Standardized assessment administration | Quantitative & qualitative assessment design |
| Dysphagia management | Risk assessment & safety protocol development |
| Family training & education | End-user training & enablement |
| Treatment plan development | Strategic planning & goal-oriented program design |
| Discharge planning | Transition management & success criteria development |

## ROLE-SPECIFIC GUIDES
### EdTech: Emphasize curriculum dev, learning outcomes, assessment design, accessibility.
### HealthTech / Customer Success: Emphasize clinical workflow, onboarding, empathy-driven support.
### UX Research: Emphasize qualitative/quantitative assessment, user interviews, observational data.
### Instructional Design: Emphasize learning objectives, scaffolded instruction, evidence-based methods.
### Product Management: Emphasize needs assessment, stakeholder mgmt, prioritization, outcomes.
### Corporate Training: Emphasize adult learning, presentation, training delivery.

## PRINCIPLES
1. NEVER use clinical jargon in output — translate everything
2. Quantify wherever possible (caseload size, stakeholders, outcomes)
3. Use corporate action verbs: spearheaded, optimized, scaled, drove, architected
4. Frame clinical work as business impact: patients=users/clients, therapy=programs, IEPs=strategic plans
5. Highlight the analytical/data-driven nature of SLP work
6. SLPs are communication strategists with behavioral science training
7. Be direct and confident, not apologetic about the transition
8. Be honest about gaps — don't sugarcoat, but always show the path forward
9. CRITICAL: When asked to return JSON, return ONLY valid JSON. No preamble, no markdown code fences, no explanatory text. Just the JSON object.`;

// ─── JSON Parser ────────────────────────────────────────────────
function parseJSONResponse(text) {
  if (!text) throw new Error("Empty response from API");
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(cleaned); } catch (e) {}
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = cleaned.slice(firstBrace, lastBrace + 1);
    try { return JSON.parse(extracted); } catch (e) {}
  }
  if (firstBrace !== -1) {
    let attempt = cleaned.slice(firstBrace);
    const ob = (attempt.match(/\{/g) || []).length;
    const cb = (attempt.match(/\}/g) || []).length;
    const obr = (attempt.match(/\[/g) || []).length;
    const cbr = (attempt.match(/\]/g) || []).length;
    attempt = attempt.replace(/,\s*"[^"]*":\s*"[^"]*$/, "").replace(/,\s*\{[^}]*$/, "").replace(/,\s*$/, "");
    for (let i = 0; i < (obr - cbr); i++) attempt += "]";
    for (let i = 0; i < (ob - cb); i++) attempt += "}";
    try { return JSON.parse(attempt); } catch (e) {}
  }
  throw new Error("Could not parse JSON. Raw: " + cleaned.slice(0, 300));
}

// ─── Utility Components ─────────────────────────────────────────
function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
      padding: "4px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6,
      border: "1px solid var(--border)", background: copied ? "var(--accent-bg)" : "var(--card)",
      color: copied ? "var(--accent)" : "var(--muted)", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
    }}>{copied ? "Copied!" : label}</button>
  );
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ width: "100%", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--muted)" }}>
        <span>Step {step} of {total}</span><span>{pct}%</span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function Card({ children, style = {}, highlight = false }) {
  return (
    <div style={{
      background: highlight ? "var(--accent-bg-subtle)" : "var(--card)",
      border: `1px solid ${highlight ? "var(--accent-bg)" : "var(--border)"}`,
      borderRadius: 12, padding: 24, marginBottom: 16, ...style,
    }}>{children}</div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <span onClick={onClick} style={{
      display: "inline-block", padding: "7px 16px", fontSize: 13,
      fontWeight: selected ? 600 : 400, borderRadius: 20,
      border: selected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
      background: selected ? "var(--accent-bg-subtle)" : "var(--card)",
      color: selected ? "var(--accent)" : "var(--muted)",
      cursor: "pointer", margin: "0 6px 8px 0", userSelect: "none",
    }}>{label}</span>
  );
}

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt" || ext === "md") return await file.text();
  if (ext === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const raw = decoder.decode(new Uint8Array(arrayBuffer));
      let text = "";
      const textRuns = raw.match(/\(([^)]+)\)/g);
      if (textRuns) text = textRuns.map(t => t.slice(1, -1)).join(" ").replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\s+/g, " ").trim();
      if (text.length > 100) return text;
      return "[Could not extract text. Use 'Paste Text' tab.]";
    } catch { return "[PDF parsing failed. Use 'Paste Text' tab.]"; }
  }
  if (ext === "docx") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth?.convertToPlainText({ arrayBuffer });
      if (result?.value) return result.value;
      return "[Could not parse .docx. Use 'Paste Text' tab.]";
    } catch { return "[DOCX parsing failed. Use 'Paste Text' tab.]"; }
  }
  return "[Unsupported file. Use .pdf, .docx, .txt or paste text.]";
}

export default function SLPCareerSuite() {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [inputMode, setInputMode] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [goals, setGoals] = useState({
    targetRoles: [],
    settings: [],          // CHANGED: now multi-select
    workPreferences: [],   // NEW: only used if "not sure" is selected
    topSkills: "",
    whyLeaving: "",
    years: "",
  });
  const [jobDesc, setJobDesc] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [writingSample, setWritingSample] = useState("");      // NEW
  const [writingSampleFileName, setWritingSampleFileName] = useState("");  // NEW
  const [showWritingSample, setShowWritingSample] = useState(false);  // NEW
  const [preview, setPreview] = useState(null);
  const [full, setFull] = useState(null);
  const [exploreResults, setExploreResults] = useState(null); // NEW
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const fileInputRef = useRef(null);
  const writingFileRef = useRef(null);
  const topRef = useRef(null);

  const isExploreMode = goals.targetRoles.length === 1 && goals.targetRoles[0] === NOT_SURE_OPTION;

  const loadingMsgs = [
    "Reading your resume through non-clinical eyes...",
    "Translating clinical jargon into market language...",
    "Matching your skills to the job description...",
    "Drafting your cover letter and interview prep...",
    "Polishing the final output (this takes a minute)...",
  ];
  const exploreLoadingMsgs = [
    "Analyzing your resume for transferable strengths...",
    "Cross-referencing your interests and clinical experience...",
    "Mapping you to non-clinical career paths...",
    "Building your personalized exploration report...",
  ];

  useEffect(() => {
    if (loading) {
      const msgs = isExploreMode ? exploreLoadingMsgs : loadingMsgs;
      let i = 0;
      setLoadMsg(msgs[0]);
      const iv = setInterval(() => { i = (i + 1) % msgs.length; setLoadMsg(msgs[i]); }, 4000);
      return () => clearInterval(iv);
    }
  }, [loading, isExploreMode]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFileError("File too large (max 5MB)"); return; }
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "txt", "md"].includes(ext)) { setFileError("Please upload .pdf, .docx, or .txt"); return; }
    setFileError("");
    setFileName(file.name);
    setResumeText(await parseFile(file));
  };

  const handleWritingSampleFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    setWritingSampleFileName(file.name);
    const text = await parseFile(file);
    setWritingSample(text);
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer?.files?.[0]); };

  // ─── Smart Company Matching ──────────────────────────────────
  // Scores each company against the user's targets, settings, and job title.
  // Uses real role names + category names from the Airtable database.
  const getRelevantCompanies = () => {
    const targetText = goals.targetRoles.join(" ").toLowerCase();
    const titleText = jobTitle.toLowerCase();
    const settingText = goals.settings.join(" ").toLowerCase();
    const allText = targetText + " " + titleText + " " + settingText;

    // Map fuzzy keywords to canonical role names in the DB
    const roleSignals = {
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

    const categorySignals = {
      "EdTech": ["edtech", "ed-tech", "education", "instructional design", "curriculum", "school", "k-12", "higher ed", "e-learning"],
      "HealthTech": ["healthtech", "health-tech", "telehealth", "telepractice", "medical", "clinical", "hospital", "snf", "rehab"],
      "SLP-Adjacent": ["slp", "speech", "language", "audiology", "aac"],
      "Coaching": ["coaching", "wellness"],
      "Recruiting": ["recruiting", "recruitment"],
    };

    // Score each company
    const scored = COMPANIES_DB.map(c => {
      let score = 0;
      const reasons = [];

      // Role match (strong signal)
      for (const [role, signals] of Object.entries(roleSignals)) {
        if (c.roles?.includes(role) && signals.some(s => allText.includes(s))) {
          score += 3;
          reasons.push(role);
        }
      }

      // Category match (medium signal)
      for (const [cat, signals] of Object.entries(categorySignals)) {
        if (c.categories?.includes(cat) && signals.some(s => allText.includes(s))) {
          score += 2;
        }
      }

      // SLP-Adjacent always gets a boost (these companies specifically hire SLPs)
      if (c.categories?.includes("SLP-Adjacent")) score += 1;

      // Setting → category hints
      if (settingText.includes("school") && c.categories?.includes("EdTech")) score += 1;
      if ((settingText.includes("hospital") || settingText.includes("rehab") || settingText.includes("snf")) && c.categories?.includes("HealthTech")) score += 1;

      return { ...c, _score: score, _matchReasons: reasons };
    });

    // Filter to companies with a real match, then sort by score
    const matched = scored.filter(c => c._score > 0).sort((a, b) => b._score - a._score);

    // If nothing matched, fall back to top SLP-Adjacent + HealthTech/EdTech mix
    if (matched.length === 0) {
      return COMPANIES_DB
        .filter(c => c.categories?.includes("SLP-Adjacent") || c.categories?.includes("HealthTech") || c.categories?.includes("EdTech"))
        .slice(0, 6);
    }

    return matched.slice(0, 8);
  };

  const getRelevantStories = () => {
    const kw = (goals.targetRoles.join(" ") + " " + jobTitle).toLowerCase();
    return TRANSITION_STORIES.filter(s =>
      s.tags.some(t => kw.includes(t.toLowerCase())) || s.to.toLowerCase().split(" ").some(w => kw.includes(w))
    ).slice(0, 3);
  };

  // ─── EXPLORE MODE: Generate career suggestions instead of resume translation ──
  const generateExplore = async () => {
    setLoading(true); setStep(STEPS.PROCESSING); setError(null); setDebugInfo(null);
    try {
      const prefs = goals.workPreferences.map(id => WORK_PREFERENCES.find(w => w.id === id)?.label).filter(Boolean);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 4000, system: SLP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `An SLP wants to leave clinical work but isn't sure what direction to go. Help them explore.\n\nResume:\n---\n${resumeText}\n---\n\nClinical settings: ${goals.settings.join(", ")}\nYears of experience: ${goals.years}\nWork aspects they enjoy: ${prefs.join(", ")}\nSkills they want to highlight: ${goals.topSkills}\nWhy they want to transition: ${goals.whyLeaving}\n\nGenerate a personalized career exploration report. Return ONLY this JSON:\n{\n  "personalitySnapshot": "2-3 sentences capturing who they are professionally and what they're optimizing for",\n  "topRoleMatches": [\n    {"role": "Specific role title", "fit": "Why this fits their preferences and SLP background (2-3 sentences)", "matchScore": 85, "salaryRange": "$60k-$95k", "dayInLife": "1 sentence about what the day looks like", "transitionDifficulty": "Easy|Moderate|Stretch"}\n  ],\n  "transferableStrengths": [\n    {"strength": "Strength name", "evidence": "Where in their resume this shows up", "sellsAs": "How to frame this in non-clinical interviews"}\n  ],\n  "exploratoryActions": [\n    {"action": "Specific thing to do this week", "why": "What it teaches you", "timeNeeded": "30 mins"}\n  ],\n  "warningQuestions": [\n    "Honest question they should ask themselves before pursuing this direction"\n  ]\n}\n\nProvide 4-5 topRoleMatches with diverse difficulty levels, 4 transferableStrengths, 4 exploratoryActions, and 3 warningQuestions. Be specific and grounded in their actual resume content.` }],
        }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = parseJSONResponse(text);
      setExploreResults(parsed);
      setStep(STEPS.EXPLORE_RESULTS);
    } catch (err) {
      console.error(err);
      setError(`Could not generate exploration: ${err.message}`);
      setStep(STEPS.GOALS);
    } finally { setLoading(false); }
  };

  const generatePreview = async () => {
    setLoading(true); setStep(STEPS.PROCESSING); setError(null); setDebugInfo(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000, system: SLP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Resume:\n---\n${resumeText}\n---\nTarget role: ${jobTitle}\nJob Description:\n---\n${jobDesc}\n---\nAbout: ${goals.years} exp, settings: ${goals.settings.join(", ")}, targets: ${goals.targetRoles.join(", ")}. Skills: ${goals.topSkills}. Why: ${goals.whyLeaving}\n\nReturn this exact JSON only:\n{"matchScore":NUMBER,"matchLevel":"Strong Match|Good Match|Stretch — But Doable","snapshot":"2 sentences","translatedBullets":[{"original":"...","translated":"..."},{"original":"...","translated":"..."},{"original":"...","translated":"..."}],"quickWins":["action 1","action 2"],"fullVersionIncludes":["Complete resume rewrite","Tailored cover letter","Gap analysis","Interview prep","LinkedIn headline","Company suggestions"]}` }],
        }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setPreview(parseJSONResponse(text));
      setStep(STEPS.PREVIEW);
    } catch (err) {
      console.error(err);
      setError(`Preview failed: ${err.message}`);
      setStep(STEPS.JOB);
    } finally { setLoading(false); }
  };

  const generateFull = async () => {
    setLoading(true); setStep(STEPS.PROCESSING); setError(null); setDebugInfo(null);
    try {
      const voiceInstruction = writingSample
        ? `\n\nIMPORTANT: Match the tone and voice of this writing sample from the candidate. Notice their sentence length, word choice, level of formality, any phrases or rhythms they tend to use. The cover letter and elevator pitch should feel like THEM, not generic AI text:\n---WRITING SAMPLE---\n${writingSample.slice(0, 3000)}\n---END SAMPLE---\n`
        : "";

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 8000, system: SLP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Resume:\n---\n${resumeText}\n---\n\nTarget role: ${jobTitle}\n\nJob Description:\n---\n${jobDesc}\n---\n\nAbout: ${goals.years} years experience, settings: ${goals.settings.join(", ")}, targets: ${goals.targetRoles.join(", ")}. Skills: ${goals.topSkills}. Why transitioning: ${goals.whyLeaving}${voiceInstruction}\n\nReturn ONLY this JSON structure with no preamble:\n\n{\n  "professionalSummary": "3-4 sentences, no clinical jargon",\n  "translatedBullets": [\n    {"original": "their bullet", "translated": "rewritten in market language", "section": "Job Title or section"}\n  ],\n  "skillsSection": {\n    "Category Name": ["skill1", "skill2"]\n  },\n  "gapAnalysis": [\n    {"gap": "...", "actionSteps": ["..."], "timeframe": "2-4 weeks", "priority": "high|medium|low"}\n  ],\n  "coverLetter": "Full cover letter as single string with \\n line breaks, 3-4 paragraphs",\n  "talkingPoints": [\n    {"question": "Likely interview Q", "bridgeStatement": "How to answer using SLP experience"}\n  ],\n  "linkedinHeadline": "Optimized headline",\n  "elevatorPitch": "30-second pitch"\n}\n\nProvide 5-8 translatedBullets, 2-3 gapAnalysis items, 3-4 talkingPoints. Valid JSON only.` }],
        }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const data = await resp.json();
      if (data.error) throw new Error(`API error: ${data.error.message}`);
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("Empty response. Stop reason: " + data.stop_reason);
      const parsed = parseJSONResponse(text);
      if (!parsed.professionalSummary || !parsed.translatedBullets) throw new Error("Missing required fields. Got: " + Object.keys(parsed).join(", "));
      setFull(parsed);
      setStep(STEPS.FULL_RESULTS);
    } catch (err) {
      console.error(err);
      setError(`Could not generate full results: ${err.message}`);
      setDebugInfo(err.stack || err.message);
      setStep(STEPS.PREVIEW);
    } finally { setLoading(false); }
  };

  const V = { "--accent": "#2D6A4F", "--accent-light": "#40916C", "--accent-bg": "#D8F3DC", "--accent-bg-subtle": "#F0FAF3", "--text": "#1B1B1E", "--muted": "#6B7280", "--light": "#9CA3AF", "--bg": "#FAFAF9", "--card": "#FFFFFF", "--border": "#E5E7EB", "--warn": "#DC6803", "--warn-bg": "#FEF3C7", "--err": "#DC2626", "--err-bg": "#FEE2E2" };
  const S = {
    root: { ...V, fontFamily: "'DM Sans', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh", padding: "0 16px" },
    wrap: { maxWidth: 680, margin: "0 auto" },
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12 },
    h2: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 },
    h3: { fontSize: 16, fontWeight: 600, marginBottom: 6 },
    p: { fontSize: 15, lineHeight: 1.65, color: "var(--muted)", marginBottom: 20 },
    label: { display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 },
    input: { width: "100%", padding: "10px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", minHeight: 120, lineHeight: 1.6, boxSizing: "border-box" },
    btn: { padding: "12px 28px", fontSize: 15, fontWeight: 600, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
    btnOut: { padding: "10px 24px", fontSize: 14, fontWeight: 500, background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    tag: { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 600, borderRadius: 4, background: "var(--accent-bg)", color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" },
  };
  const focusB = (e) => e.target.style.borderColor = "var(--accent)";
  const blurB = (e) => e.target.style.borderColor = "var(--border)";
  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const ErrorBanner = () => error && (
    <Card style={{ background: "var(--err-bg)", borderColor: "#FCA5A5", marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--err)", marginBottom: 6 }}>⚠️ Something went wrong</div>
      <div style={{ fontSize: 13, color: "var(--err)", marginBottom: 8 }}>{error}</div>
      {debugInfo && (
        <details style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
          <summary style={{ cursor: "pointer" }}>Show technical details</summary>
          <pre style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "auto", maxHeight: 120 }}>{debugInfo}</pre>
        </details>
      )}
    </Card>
  );

  // ─── WELCOME ──────────────────────────────────────────────────
  const renderWelcome = () => (
    <div style={{ ...S.wrap, textAlign: "center", padding: "48px 0 20px" }}>
      <span style={S.tag}>Free Preview • No Account Required</span>
      <h1 style={{ ...S.h1, fontSize: 36, marginTop: 16 }}>Your SLP resume, translated<br/>into a career you actually want.</h1>
      <p style={{ ...S.p, maxWidth: 520, margin: "0 auto 28px", fontSize: 16 }}>Upload your resume and a job description. We'll show you exactly how your clinical experience maps to non-clinical roles — in language hiring managers understand.</p>
      <button style={S.btn} onClick={() => setStep(STEPS.RESUME)} onMouseEnter={e => e.target.style.background = "var(--accent-light)"} onMouseLeave={e => e.target.style.background = "var(--accent)"}>Start Your Translation →</button>
      <p style={{ fontSize: 13, color: "var(--light)", marginTop: 14 }}>Takes ~3 minutes • Full package from $24</p>

      <Card style={{ marginTop: 36, textAlign: "left" }} highlight>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>What you'll get:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
          {[["✓","Skills match score",true],["✓","3 sample bullet translations",true],["⟡","Full resume rewrite",false],["⟡","Tailored cover letter",false],["⟡","Gap analysis + action plan",false],["⟡","Interview talking points",false],["⟡","LinkedIn headline",false],["⟡","Companies hiring for your role",false]].map(([icon,text,free],i) => (
            <div key={i} style={{ fontSize: 14, display: "flex", gap: 8, padding: "3px 0", color: free ? "var(--text)" : "var(--muted)" }}>
              <span style={{ color: free ? "var(--accent)" : "var(--light)", flexShrink: 0 }}>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 8, textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>Not sure what role you want yet?</div>
        <div style={{ fontSize: 14, color: "var(--text)" }}>
          When you get to the goals screen, select <strong style={{ color: "var(--accent)" }}>"Not sure yet — help me explore"</strong> and we'll switch to a different flow that suggests roles based on what you actually enjoy doing.
        </div>
      </Card>
    </div>
  );

  // ─── RESUME ───────────────────────────────────────────────────
  const renderResume = () => (
    <div style={S.wrap}>
      <ProgressBar step={1} total={4} />
      <h2 style={S.h2}>Let's start with your resume.</h2>
      <p style={S.p}>Upload a file or paste your resume text.</p>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {["upload","paste"].map(mode => (
          <button key={mode} onClick={() => setInputMode(mode)} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: inputMode === mode ? 600 : 400,
            color: inputMode === mode ? "var(--accent)" : "var(--muted)",
            background: "none", border: "none", cursor: "pointer",
            borderBottom: inputMode === mode ? "2px solid var(--accent)" : "2px solid transparent",
            fontFamily: "'DM Sans', sans-serif",
          }}>{mode === "upload" ? "📎 Upload File" : "📋 Paste Text"}</button>
        ))}
      </div>

      {inputMode === "upload" ? (
        <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`, borderRadius: 12,
          padding: "48px 24px", textAlign: "center", background: isDragging ? "var(--accent-bg-subtle)" : "var(--card)",
          cursor: "pointer", marginBottom: 16,
        }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
          {fileName ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fileName}</div>
              <div style={{ fontSize: 13, color: resumeText.length > 100 ? "var(--accent)" : "var(--warn)", marginTop: 4 }}>
                {resumeText.length > 100 ? `✓ ${resumeText.split(/\s+/).length} words extracted` : "⚠ Limited text — try Paste Text"}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFileName(""); setResumeText(""); }} style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>Remove</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Drop your resume here, or click to browse</div>
              <div style={{ fontSize: 13, color: "var(--light)", marginTop: 6 }}>PDF, DOCX, or TXT • Max 5MB</div>
            </div>
          )}
        </div>
      ) : (
        <textarea style={{ ...S.textarea, minHeight: 200 }} value={resumeText} onChange={e => setResumeText(e.target.value)}
          placeholder={"Paste your full resume here..."} onFocus={focusB} onBlur={blurB} />
      )}

      {fileError && <div style={{ fontSize: 13, color: "var(--err)", marginBottom: 12 }}>{fileError}</div>}
      <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 20 }}>💡 Include job titles, bullet points, and metrics</p>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.WELCOME)}>← Back</button>
        <button style={{ ...S.btn, opacity: resumeText.length < 50 ? 0.4 : 1 }} disabled={resumeText.length < 50} onClick={() => setStep(STEPS.GOALS)}>Continue →</button>
      </div>
    </div>
  );

  // ─── GOALS (with multi-select settings + explore mode) ───────
  const renderGoals = () => (
    <div style={S.wrap}>
      <ProgressBar step={2} total={isExploreMode ? 3 : 4} />
      <h2 style={S.h2}>Tell us about your transition.</h2>
      <p style={S.p}>This tailors the experience to your situation.</p>

      <ErrorBanner />

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>What roles interest you? (pick all that apply)</label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {ROLE_OPTIONS.map(r => (
            <Chip key={r} label={r} selected={goals.targetRoles.includes(r)} onClick={() => {
              setGoals(p => ({
                ...p,
                targetRoles: p.targetRoles.includes(r)
                  ? p.targetRoles.filter(x => x !== r)
                  : [...p.targetRoles.filter(x => x !== NOT_SURE_OPTION), r],
              }));
            }} />
          ))}
        </div>
        <div style={{ marginTop: 8, padding: "12px 14px", background: isExploreMode ? "var(--accent-bg-subtle)" : "var(--bg)", borderRadius: 8, border: `1px solid ${isExploreMode ? "var(--accent)" : "var(--border)"}` }}>
          <Chip label={NOT_SURE_OPTION} selected={isExploreMode} onClick={() => {
            setGoals(p => ({ ...p, targetRoles: isExploreMode ? [] : [NOT_SURE_OPTION] }));
          }} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Choose this and we'll suggest roles based on what you enjoy doing instead of translating for one specific job.
          </div>
        </div>
      </div>

      {/* Show work preferences if "not sure" is selected */}
      {isExploreMode && (
        <div style={{ marginBottom: 24, padding: 20, background: "var(--accent-bg-subtle)", borderRadius: 12, border: "1px solid var(--accent-bg)" }}>
          <label style={{ ...S.label, color: "var(--accent)", fontSize: 15, marginBottom: 4 }}>What aspects of your work do you actually enjoy?</label>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, marginTop: 0 }}>Pick at least 3. Be honest — this is what we'll use to suggest roles that fit you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {WORK_PREFERENCES.map(p => {
              const sel = goals.workPreferences.includes(p.id);
              return (
                <div key={p.id} onClick={() => {
                  setGoals(prev => ({ ...prev, workPreferences: sel ? prev.workPreferences.filter(x => x !== p.id) : [...prev.workPreferences, p.id] }));
                }} style={{
                  padding: "10px 12px", border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                  background: sel ? "#fff" : "var(--card)", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sel ? "var(--accent)" : "var(--text)" }}>
                    {sel && "✓ "}{p.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings — now multi-select */}
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Clinical setting(s) <span style={{ fontWeight: 400, color: "var(--light)" }}>(pick all that apply)</span></label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {SETTING_OPTIONS.map(s => (
            <Chip key={s} label={s} selected={goals.settings.includes(s)} onClick={() => {
              setGoals(p => ({
                ...p,
                settings: p.settings.includes(s) ? p.settings.filter(x => x !== s) : [...p.settings, s],
              }));
            }} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Years of experience</label>
        <input style={{ ...S.input, maxWidth: 200 }} placeholder="e.g., 5 years" value={goals.years} onChange={e => setGoals(p => ({ ...p, years: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Skills to highlight</label>
        <textarea style={{ ...S.textarea, minHeight: 70 }} placeholder="data analysis, project management, training..." value={goals.topSkills} onChange={e => setGoals(p => ({ ...p, topSkills: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Why are you transitioning? <span style={{ fontWeight: 400, color: "var(--light)" }}>(optional)</span></label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} placeholder="Burnout? Curiosity? Want autonomy?" value={goals.whyLeaving} onChange={e => setGoals(p => ({ ...p, whyLeaving: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.RESUME)}>← Back</button>
        {isExploreMode ? (
          <button
            style={{ ...S.btn, opacity: goals.workPreferences.length < 3 ? 0.4 : 1 }}
            disabled={goals.workPreferences.length < 3}
            onClick={generateExplore}
          >
            Explore My Career Paths →
          </button>
        ) : (
          <button
            style={{ ...S.btn, opacity: goals.targetRoles.length === 0 ? 0.4 : 1 }}
            disabled={goals.targetRoles.length === 0}
            onClick={() => setStep(STEPS.JOB)}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );

  const renderJob = () => (
    <div style={S.wrap}>
      <ProgressBar step={3} total={4} />
      <h2 style={S.h2}>Paste the job you're targeting.</h2>
      <p style={S.p}>The more specific, the better the translation.</p>

      <ErrorBanner />

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Job title</label>
        <input style={S.input} placeholder="e.g., Customer Success Manager" value={jobTitle} onChange={e => setJobTitle(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Full job description</label>
        <textarea style={{ ...S.textarea, minHeight: 200 }} placeholder="Paste the complete description..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>

      {/* Optional Writing Sample */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowWritingSample(!showWritingSample)} style={{
          background: "none", border: "1px dashed var(--border)", borderRadius: 8,
          padding: "10px 14px", width: "100%", textAlign: "left", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            {showWritingSample ? "▾" : "▸"} Make my cover letter sound like ME (optional)
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Upload an old cover letter or paste a writing sample — we'll match your tone and voice.
          </div>
        </button>

        {showWritingSample && (
          <div style={{ marginTop: 12, padding: 16, background: "var(--accent-bg-subtle)", borderRadius: 8 }}>
            <input ref={writingFileRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: "none" }} onChange={e => handleWritingSampleFile(e.target.files?.[0])} />

            {writingSampleFileName && (
              <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8 }}>
                ✓ {writingSampleFileName} ({writingSample.split(/\s+/).length} words)
                <button onClick={() => { setWritingSampleFileName(""); setWritingSample(""); }} style={{ marginLeft: 8, fontSize: 12, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Remove</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => writingFileRef.current?.click()} style={{ ...S.btnOut, fontSize: 13, padding: "6px 14px" }}>📎 Upload Sample</button>
              <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>or paste below:</span>
            </div>

            <textarea style={{ ...S.textarea, minHeight: 100, fontSize: 13 }}
              placeholder="Paste a cover letter, email, or any writing that sounds like you. We'll mirror your tone in the AI-generated cover letter."
              value={writingSample} onChange={e => { setWritingSample(e.target.value); if (writingSampleFileName) setWritingSampleFileName(""); }}
              onFocus={focusB} onBlur={blurB} />
            <div style={{ fontSize: 11, color: "var(--light)", marginTop: 4 }}>
              💡 Even 100-200 words is enough to capture your voice
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.GOALS)}>← Back</button>
        <button style={{ ...S.btn, opacity: (jobDesc.length < 50 || !jobTitle) ? 0.4 : 1 }} disabled={jobDesc.length < 50 || !jobTitle} onClick={() => setStep(STEPS.EMAIL)}>Continue →</button>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div style={S.wrap}>
      <ProgressBar step={4} total={4} />
      <h2 style={S.h2}>Where should we send your results?</h2>
      <p style={S.p}>Email lets us send your results so you don't lose them. We'll also send our best transition resources (no spam).</p>
      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Email address</label>
        <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.JOB)}>← Back</button>
        <button style={{ ...S.btn, opacity: !email.includes("@") ? 0.4 : 1 }} disabled={!email.includes("@")} onClick={generatePreview}>Generate My Free Preview →</button>
      </div>
      <button onClick={generatePreview} style={{ background: "none", border: "none", color: "var(--light)", fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>Skip — just show my preview</button>
    </div>
  );

  const renderProcessing = () => (
    <div style={{ ...S.wrap, textAlign: "center", padding: "80px 0" }}>
      <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ ...S.h2, marginBottom: 12 }}>{isExploreMode ? "Building your career exploration..." : "Translating your experience..."}</h2>
      <p style={{ ...S.p, maxWidth: 400, margin: "0 auto" }}>{loadMsg}</p>
      <p style={{ fontSize: 12, color: "var(--light)", marginTop: 16 }}>This takes 30-60 seconds. Don't close this window.</p>
    </div>
  );

  // ─── EXPLORE RESULTS (NEW) ────────────────────────────────────
  const renderExploreResults = () => {
    if (!exploreResults) return null;
    const { personalitySnapshot, topRoleMatches, transferableStrengths, exploratoryActions, warningQuestions } = exploreResults;

    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={S.tag}>Career Exploration Report</span>
          <h2 style={{ ...S.h2, marginTop: 12 }}>Your Personalized Path Forward</h2>
        </div>

        <Card highlight>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>YOUR PROFESSIONAL SNAPSHOT</div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{personalitySnapshot}</div>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Top Role Matches for You</h3>
          {topRoleMatches?.map((r, i) => (
            <div key={i} style={{ padding: 16, marginBottom: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{r.role}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: r.transitionDifficulty === "Easy" ? "#D1FAE5" : r.transitionDifficulty === "Moderate" ? "#FEF3C7" : "#FEE2E2", color: r.transitionDifficulty === "Easy" ? "#065F46" : r.transitionDifficulty === "Moderate" ? "#92400E" : "#991B1B" }}>{r.transitionDifficulty}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{r.matchScore}%</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8, lineHeight: 1.6 }}>{r.fit}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
                <span>💰 {r.salaryRange}</span>
                <span>📅 {r.dayInLife}</span>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Your Transferable Strengths</h3>
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>What you already have that the market wants:</p>
          {transferableStrengths?.map((s, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--accent-bg-subtle)", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{s.strength}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}><strong style={{ color: "var(--text)" }}>Where it shows up:</strong> {s.evidence}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}><strong style={{ color: "var(--text)" }}>How to sell it:</strong> {s.sellsAs}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>🎯 Try This Week</h3>
          {exploratoryActions?.map((a, i) => (
            <div key={i} style={{ padding: "10px 0 10px 14px", borderLeft: "2px solid var(--accent)", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{a.action} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--light)" }}>· {a.timeNeeded}</span></div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{a.why}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Honest Questions to Sit With</h3>
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Before you commit to a direction:</p>
          {warningQuestions?.map((q, i) => (
            <div key={i} style={{ fontSize: 14, padding: "10px 14px", background: "var(--warn-bg)", borderRadius: 8, marginBottom: 8, color: "var(--text)", lineHeight: 1.6 }}>
              {q}
            </div>
          ))}
        </Card>

        <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>Found a role that interests you?</h3>
          <p style={{ ...S.p, maxWidth: 440, margin: "0 auto 16px" }}>Once you've narrowed in, come back and run the Resume Translator on a real job posting to get a tailored resume, cover letter, and interview prep.</p>
          <button style={S.btn} onClick={() => {
            setGoals(p => ({ ...p, targetRoles: [], workPreferences: [] }));
            setExploreResults(null);
            setStep(STEPS.GOALS);
          }}>Translate for a Specific Role →</button>
        </Card>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button style={{ ...S.btnOut, fontSize: 13 }} onClick={() => { setStep(STEPS.WELCOME); setExploreResults(null); }}>← Start over</button>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!preview) return null;
    const { matchScore, matchLevel, snapshot, translatedBullets, quickWins, fullVersionIncludes } = preview;
    const stories = getRelevantStories();

    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={S.tag}>Free Preview</span>
          <h2 style={{ ...S.h2, marginTop: 12 }}>Your SLP → {jobTitle} Translation</h2>
        </div>

        <ErrorBanner />

        <Card highlight>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: "var(--accent)", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{matchScore}%</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{matchLevel}</div>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{snapshot}</p>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ ...S.h3, margin: 0 }}>Sample Bullet Translations</h3>
            <CopyButton text={translatedBullets?.map(b => b.translated).join("\n\n")} label="Copy all" />
          </div>
          {translatedBullets?.map((b, i) => (
            <div key={i} style={{ marginBottom: i < translatedBullets.length - 1 ? 20 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--light)", marginBottom: 4, letterSpacing: "0.04em" }}>BEFORE</div>
              <div style={{ fontSize: 14, color: "var(--muted)", padding: "8px 12px", background: "#F9FAFB", borderRadius: 6, marginBottom: 8, borderLeft: "3px solid var(--border)", lineHeight: 1.6 }}>{b.original}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4, letterSpacing: "0.04em" }}>AFTER</div>
              <div style={{ fontSize: 14, color: "var(--text)", padding: "8px 12px", background: "var(--accent-bg-subtle)", borderRadius: 6, borderLeft: "3px solid var(--accent)", lineHeight: 1.6, fontWeight: 500 }}>{b.translated}</div>
              {i < translatedBullets.length - 1 && <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />}
            </div>
          ))}
        </Card>

        {quickWins?.length > 0 && (
          <Card>
            <h3 style={{ ...S.h3, marginBottom: 10 }}>🎯 Do This Week</h3>
            {quickWins.map((w, i) => (
              <div key={i} style={{ fontSize: 14, color: "var(--text)", padding: "6px 0 6px 12px", borderLeft: "2px solid var(--accent)", marginBottom: 8, lineHeight: 1.6 }}>{w}</div>
            ))}
          </Card>
        )}

        {stories.length > 0 && (
          <Card>
            <h3 style={{ ...S.h3, marginBottom: 10 }}>SLPs who made similar transitions</h3>
            {stories.map((s, i) => (
              <div key={i} style={{ padding: "10px 14px", background: i % 2 === 0 ? "var(--accent-bg-subtle)" : "#F9FAFB", borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}: {s.from} → {s.to}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", marginTop: 4 }}>"{s.quote}"</div>
              </div>
            ))}
          </Card>
        )}

        <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>Get the full translation package</h3>
          <p style={{ ...S.p, maxWidth: 440, margin: "0 auto 16px" }}>Every bullet rewritten, cover letter, gap analysis, interview prep, LinkedIn headline, and companies hiring — all for this exact role.</p>
          {fullVersionIncludes?.map((item, i) => (
            <div key={i} style={{ fontSize: 14, padding: "3px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}>✓</span> {item}
            </div>
          ))}
          <button style={{ ...S.btn, padding: "14px 40px", fontSize: 16, marginTop: 20 }} onClick={generateFull}
            onMouseEnter={e => e.target.style.background = "var(--accent-light)"} onMouseLeave={e => e.target.style.background = "var(--accent)"}>
            Get Full Results — $24
          </button>
          <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>Prototype: clicking generates results without payment for testing</p>
        </Card>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button style={{ ...S.btnOut, fontSize: 13 }} onClick={() => { setStep(STEPS.RESUME); setPreview(null); setError(null); }}>← Start over</button>
        </div>
      </div>
    );
  };

  const renderFull = () => {
    if (!full) return null;
    const { professionalSummary, translatedBullets, skillsSection, gapAnalysis, coverLetter, talkingPoints, linkedinHeadline, elevatorPitch } = full;
    const companies = getRelevantCompanies();
    const stories = getRelevantStories();

    const Section = ({ title, id, children, copyText }) => {
      const open = expandedSections[id] !== false;
      return (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleSection(id)}>
            <h3 style={{ ...S.h3, margin: 0 }}>{title}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {copyText && open && <CopyButton text={copyText} />}
              <span style={{ fontSize: 18, color: "var(--muted)", transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
            </div>
          </div>
          {open && <div style={{ marginTop: 16 }}>{children}</div>}
        </Card>
      );
    };

    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ ...S.tag, background: "var(--accent)", color: "#fff" }}>Full Results</span>
          <h2 style={{ ...S.h2, marginTop: 12 }}>Your Complete Translation: {jobTitle}</h2>
          {writingSample && <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>✓ Cover letter calibrated to your voice</p>}
        </div>

        {elevatorPitch && (
          <Card highlight>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>YOUR 30-SECOND PITCH</div>
                <div style={{ fontSize: 15, lineHeight: 1.7 }}>{elevatorPitch}</div>
              </div>
              <CopyButton text={elevatorPitch} />
            </div>
          </Card>
        )}

        {linkedinHeadline && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 4 }}>LINKEDIN HEADLINE</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{linkedinHeadline}</div>
              </div>
              <CopyButton text={linkedinHeadline} />
            </div>
          </Card>
        )}

        <Section title="Professional Summary" id="summary" copyText={professionalSummary}>
          <div style={{ fontSize: 15, lineHeight: 1.7, padding: "12px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>{professionalSummary}</div>
        </Section>

        <Section title="Translated Experience" id="bullets" copyText={translatedBullets?.map(b => `• ${b.translated}`).join("\n")}>
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Every bullet rewritten for this role.</p>
          {translatedBullets?.map((b, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              {(i === 0 || b.section !== translatedBullets[i-1]?.section) && b.section && (
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: i > 0 ? 12 : 0 }}>{b.section}</div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 12px", background: "#F9FAFB", borderRadius: 6, borderLeft: "2px solid var(--border)", lineHeight: 1.6 }}>{b.original}</div>
                <div style={{ fontSize: 13, padding: "8px 12px", background: "var(--accent-bg-subtle)", borderRadius: 6, borderLeft: "2px solid var(--accent)", lineHeight: 1.6, fontWeight: 500 }}>{b.translated}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section title="ATS-Optimized Skills" id="skills" copyText={skillsSection ? Object.entries(skillsSection).map(([c,s]) => `${c}: ${s.join(", ")}`).join("\n") : ""}>
          {skillsSection && Object.entries(skillsSection).map(([cat, skills]) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills?.map((s, i) => <span key={i} style={{ fontSize: 13, padding: "4px 12px", background: "var(--accent-bg-subtle)", borderRadius: 16 }}>{s}</span>)}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Gap Analysis" id="gaps">
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Honest assessment + action plan.</p>
          {gapAnalysis?.map((g, i) => (
            <div key={i} style={{ padding: "14px 16px", background: g.priority === "high" ? "var(--warn-bg)" : g.priority === "medium" ? "#FEF9EF" : "#F0F9FF", borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{g.gap}</div>
                {g.priority && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: g.priority === "high" ? "#FDE68A" : "#E0F2FE", color: g.priority === "high" ? "#92400E" : "#0369A1" }}>{g.priority}</span>}
              </div>
              {g.actionSteps?.map((s, j) => <div key={j} style={{ fontSize: 13, color: "var(--muted)", padding: "2px 0 2px 16px" }}>→ {s}</div>)}
              {g.timeframe && <div style={{ fontSize: 12, color: "var(--light)", marginTop: 6 }}>⏱ {g.timeframe}</div>}
            </div>
          ))}
        </Section>

        <Section title="Tailored Cover Letter" id="cover" copyText={coverLetter}>
          <div style={{ fontSize: 14, lineHeight: 1.75, padding: "16px 20px", background: "#FEFEFE", border: "1px solid var(--border)", borderRadius: 8, whiteSpace: "pre-wrap" }}>{coverLetter}</div>
        </Section>

        <Section title="Interview Bridge Statements" id="interview" copyText={talkingPoints?.map(t => `Q: ${t.question}\nA: ${t.bridgeStatement}`).join("\n\n")}>
          {talkingPoints?.map((tp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Q: {tp.question}</div>
              <div style={{ fontSize: 14, color: "var(--muted)", padding: "10px 14px", background: "var(--accent-bg-subtle)", borderRadius: 8, borderLeft: "3px solid var(--accent)", lineHeight: 1.65 }}>{tp.bridgeStatement}</div>
            </div>
          ))}
        </Section>

        {companies.length > 0 && (
          <Section title={`Companies Hiring for ${jobTitle}-type Roles`} id="companies">
            <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>From our curated database of 123 ed-tech and health-tech companies that hire former clinicians. Sorted by best match for your background.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {companies.map((c, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "var(--accent-bg-subtle)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                    {c._matchReasons?.length > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: "var(--accent)", color: "#fff", whiteSpace: "nowrap" }}>
                        {c._matchReasons[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--accent)" }}>{c.categories?.join(" • ")}</div>
                  <a href={`https://${c.url}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>{c.url} ↗</a>
                  {c.note && <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 2 }}>{c.note}</div>}
                  {c.roles?.length > 0 && (
                    <div style={{ fontSize: 11, color: "var(--light)", marginTop: 4 }}>
                      Roles: {c.roles.slice(0, 4).join(", ")}{c.roles.length > 4 ? "..." : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, padding: "10px 14px", background: "#F9FAFB", borderRadius: 6 }}>
              💡 <strong>Pro tip:</strong> Visit each company's careers page directly. Filter for the role types listed and reference your translated bullets above when applying.
            </div>
          </Section>
        )}

        {stories.length > 0 && (
          <Section title="SLPs Who Made Similar Transitions" id="stories">
            {stories.map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", background: i % 2 === 0 ? "var(--accent-bg-subtle)" : "#F9FAFB", borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}: {s.from} → {s.to}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.setting}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", marginTop: 6 }}>"{s.quote}"</div>
              </div>
            ))}
          </Section>
        )}

        <div style={{ textAlign: "center", marginTop: 28, marginBottom: 40 }}>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>Copy each section into your resume, cover letter, and LinkedIn.</p>
          <button style={S.btnOut} onClick={() => { setStep(STEPS.WELCOME); setPreview(null); setFull(null); setResumeText(""); setJobDesc(""); setJobTitle(""); setError(null); setWritingSample(""); setWritingSampleFileName(""); }}>Translate for another role →</button>
        </div>
      </div>
    );
  };

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <div ref={topRef} />
      <div style={{ ...S.wrap, padding: "32px 0 20px", borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>SLP Transitions</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Career Pivot Suite</div>
          </div>
        </div>
      </div>

      {step === STEPS.WELCOME && renderWelcome()}
      {step === STEPS.RESUME && renderResume()}
      {step === STEPS.GOALS && renderGoals()}
      {step === STEPS.JOB && renderJob()}
      {step === STEPS.EMAIL && renderEmail()}
      {step === STEPS.PROCESSING && renderProcessing()}
      {step === STEPS.PREVIEW && renderPreview()}
      {step === STEPS.FULL_RESULTS && renderFull()}
      {step === STEPS.EXPLORE_RESULTS && renderExploreResults()}

      <div style={{ ...S.wrap, padding: "24px 0", borderTop: "1px solid var(--border)", marginTop: 32, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--light)" }}>SLP Transitions • Your degree isn't a prison. Your skills compound.</p>
      </div>
    </div>
  );
}
