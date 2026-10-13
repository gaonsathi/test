// ======================================================================
//  STATIC SCHEMES — 👩 महिला, 🎓 छात्र, 👴 बुज़ुर्ग, ♿ दिव्यांग
//  Built-in data (no server needed). Same schema as schemes.json.
//  Verified Oct 2026 — amounts/limits can change, check official site.
// ======================================================================
(function () {
  const L = a => a.join('\n');
  const U = '2026-10-13T00:00:00.000Z';
  const ONGOING = 'चालू — कभी भी आवेदन करें';
  const ONGOING_EN = 'Ongoing — apply anytime';
  const mk = (tag, o) => Object.assign({ tag, isNew: false, published: true, lastDate: ONGOING, lastDateEn: ONGOING_EN, createdAt: U, updatedAt: U, _static: true }, o);
  (window.GS_STATIC_SCHEMES = window.GS_STATIC_SCHEMES || []).push(

  // ───────────────────────── 👩 WOMEN ─────────────────────────
  mk('women', {
    slug: 'pm-matru-vandana-yojana', icon: '🤱',
    title: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY)', titleEn: 'PM Matru Vandana Yojana (PMMVY)',
    ministry: 'महिला एवं बाल विकास मंत्रालय', ministryEn: 'Ministry of Women & Child Development',
    oneLineSummary: 'पहले बच्चे के जन्म पर गर्भवती/स्तनपान कराने वाली माताओं को पोषण के लिए ₹5,000।',
    oneLineSummaryEn: '₹5,000 for nutrition to pregnant / lactating mothers on the birth of the first child.',
    benefit: '₹5,000 तीन किस्तों में सीधे बैंक खाते में; दूसरी संतान बेटी हो तो ₹6,000 एकमुश्त',
    benefitEn: '₹5,000 in three instalments to your bank account; ₹6,000 in one go if the second child is a girl',
    description: L(['गर्भावस्था और प्रसव के दौरान महिला मज़दूरी छोड़ देती है और पोषण की कमी हो जाती है। इस योजना में पहले जीवित बच्चे के लिए ₹5,000 (₹1,000 + ₹2,000 + ₹2,000) तीन किस्तों में मिलते हैं — गर्भावस्था पंजीकरण, कम से कम एक प्रसव-पूर्व जांच और बच्चे के जन्म पंजीकरण व पहले टीकाकरण के बाद।', 'अगर आप अस्पताल में प्रसव कराती हैं तो जननी सुरक्षा योजना (JSY) के तहत लगभग ₹1,000 और मिलते हैं। दूसरी संतान बेटी होने पर मिशन शक्ति के तहत ₹6,000 एकमुश्त मिलता है।']),
    descriptionEn: L(['During pregnancy and delivery a woman often stops working and nutrition suffers. This scheme pays ₹5,000 (₹1,000 + ₹2,000 + ₹2,000) in three instalments for the first living child — after pregnancy registration, at least one antenatal check-up, and child birth registration with first vaccination.', 'If you deliver in a hospital, about ₹1,000 more comes under the Janani Suraksha Yojana (JSY). If the second child is a girl, ₹6,000 is paid in one go under Mission Shakti.']),
    eligibility: L(['19 वर्ष या उससे अधिक उम्र की गर्भवती और स्तनपान कराने वाली माताएं', 'पहले जीवित बच्चे के लिए (दूसरी बेटी पर अलग लाभ)', 'नियमित सरकारी/PSU कर्मचारी जिन्हें मातृत्व अवकाश मिलता है, पात्र नहीं']),
    eligibilityEn: L(['Pregnant and lactating mothers aged 19 or above', 'For the first living child (separate benefit for a second girl child)', 'Regular govt/PSU employees who get maternity leave are not eligible']),
    documentsRequired: L(['आधार कार्ड (माता का)', 'बैंक / डाकघर खाता पासबुक', 'MCP कार्ड (मातृ एवं शिशु सुरक्षा कार्ड)', 'पति का आधार कार्ड', 'गर्भावस्था पंजीकरण का प्रमाण']),
    documentsRequiredEn: L(['Aadhaar Card (of the mother)', 'Bank / post office passbook', 'MCP card (Mother & Child Protection card)', 'Husband\'s Aadhaar Card', 'Proof of pregnancy registration']),
    howToApply: L(['अपने गांव की आंगनवाड़ी कार्यकर्ता या ASHA दीदी से संपर्क करें', 'गर्भावस्था का पंजीकरण कराएं और फॉर्म 1-A भरें', 'हर चरण (प्रसव-पूर्व जांच, जन्म पंजीकरण/टीकाकरण) पर फॉर्म 1-B और 1-C जमा करें', 'पैसा किस्तों में सीधे आपके बैंक खाते में आएगा']),
    howToApplyEn: L(['Contact your village Anganwadi worker or ASHA', 'Register the pregnancy and fill Form 1-A', 'Submit Forms 1-B and 1-C at each stage (antenatal check-up, birth registration/vaccination)', 'Money arrives in instalments directly in your bank account']),
    officialLink: 'https://pmmvy.wcd.gov.in',
    faqs: [{ q: 'क्या दूसरे बच्चे पर भी पैसा मिलेगा?', qEn: 'Is money given for the second child too?', a: 'सामान्यतः नहीं, पर दूसरी संतान बेटी हो तो मिशन शक्ति के तहत ₹6,000 एकमुश्त मिलते हैं।', aEn: 'Generally no, but if the second child is a girl, ₹6,000 is paid in one go under Mission Shakti.' }]
  }),

  mk('women', {
    slug: 'sukanya-samriddhi-yojana', icon: '👧',
    title: 'सुकन्या समृद्धि योजना', titleEn: 'Sukanya Samriddhi Yojana',
    ministry: 'वित्त मंत्रालय (डाक विभाग)', ministryEn: 'Ministry of Finance (Department of Posts)',
    oneLineSummary: 'बेटी की पढ़ाई और शादी के लिए ऊंचे ब्याज वाली सरकारी बचत योजना, टैक्स-फ्री।',
    oneLineSummaryEn: 'A high-interest, tax-free government savings scheme for your daughter\'s education and marriage.',
    benefit: 'बचत पर सरकारी ब्याज (हर तिमाही तय, बाकी बचत योजनाओं से ऊंचा); ब्याज और मैच्योरिटी टैक्स-फ्री',
    benefitEn: 'Government-set interest (revised quarterly, higher than most savings schemes); interest and maturity are tax-free',
    description: L(['10 साल से कम उम्र की बेटी के नाम माता-पिता या अभिभावक यह खाता खुलवा सकते हैं। साल में कम से कम ₹250 और ज़्यादा से ज़्यादा ₹1.5 लाख जमा कर सकते हैं। पैसा 15 साल तक जमा करना होता है और खाता बेटी के 21 साल की उम्र पर पूरा होता है।', 'बेटी 18 साल की हो जाए तो उच्च शिक्षा या शादी के लिए जमा रकम का 50% तक निकाला जा सकता है। ब्याज दर सरकार हर तिमाही तय करती है — ताज़ा दर डाकघर या बैंक से पूछ लें।']),
    descriptionEn: L(['Parents or guardians can open this account for a girl below 10 years. You can deposit a minimum of ₹250 and a maximum of ₹1.5 lakh a year. Deposits are made for 15 years and the account matures when the girl turns 21.', 'Once she is 18, up to 50% of the balance can be withdrawn for higher education or marriage. The interest rate is set by the government every quarter — ask the post office or bank for the current rate.']),
    eligibility: L(['बेटी की उम्र 10 वर्ष से कम', 'एक परिवार में अधिकतम 2 बेटियों के खाते (जुड़वा/तीन बेटियों पर छूट)', 'बेटी भारत की निवासी हो']),
    eligibilityEn: L(['Girl child below 10 years of age', 'Maximum 2 daughters\' accounts per family (relaxation for twins/triplets)', 'Girl must be an Indian resident']),
    documentsRequired: L(['बेटी का जन्म प्रमाण पत्र', 'माता/पिता या अभिभावक का आधार कार्ड', 'अभिभावक का पता प्रमाण', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Girl\'s birth certificate', 'Aadhaar Card of parent/guardian', 'Address proof of guardian', 'Passport size photo']),
    howToApply: L(['नज़दीकी डाकघर या अधिकृत बैंक शाखा में जाएं', 'सुकन्या समृद्धि खाता खोलने का फॉर्म भरें', 'जन्म प्रमाण पत्र और पहचान/पते के कागज़ जमा करें', 'न्यूनतम ₹250 से खाता शुरू करें; पासबुक लें']),
    howToApplyEn: L(['Visit the nearest post office or authorised bank branch', 'Fill the Sukanya Samriddhi account opening form', 'Submit birth certificate and ID/address documents', 'Start with a minimum of ₹250; collect the passbook']),
    officialLink: 'https://www.indiapost.gov.in',
    faqs: [{ q: 'अगर किसी साल पैसा जमा न कर पाए तो?', qEn: 'What if I miss a year\'s deposit?', a: 'खाता डिफ़ॉल्ट हो जाता है, पर ₹50 जुर्माना और बकाया न्यूनतम राशि जमा करके 15 साल के भीतर चालू कराया जा सकता है।', aEn: 'The account becomes defaulted, but you can revive it within the deposit period by paying the minimum deposit with a ₹50 penalty.' }]
  }),

  mk('women', {
    slug: 'pm-ujjwala-yojana', icon: '🔥',
    title: 'प्रधानमंत्री उज्ज्वला योजना', titleEn: 'PM Ujjwala Yojana',
    ministry: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय', ministryEn: 'Ministry of Petroleum & Natural Gas',
    oneLineSummary: 'गरीब परिवार की महिला को मुफ़्त LPG गैस कनेक्शन — चूल्हे के धुएं से मुक्ति।',
    oneLineSummaryEn: 'Free LPG connection for women from poor households — freedom from chulha smoke.',
    benefit: 'मुफ़्त LPG कनेक्शन और हर रिफ़िल पर ₹300 की सब्सिडी',
    benefitEn: 'Free LPG connection and ₹300 subsidy on each refill',
    description: L(['लकड़ी और उपले के चूल्हे का धुआं महिलाओं की सेहत के लिए बहुत हानिकारक है। उज्ज्वला योजना में गरीब परिवार की वयस्क महिला के नाम मुफ़्त गैस कनेक्शन मिलता है — यानी कनेक्शन की सिक्योरिटी राशि सरकार देती है।', 'उज्ज्वला लाभार्थियों को घरेलू सिलेंडर पर ₹300 की लक्षित सब्सिडी भी सीधे बैंक खाते में मिलती है। चूल्हा और पहला सिलेंडर कई बार किस्तों में तेल कंपनी द्वारा दिया जाता है।']),
    descriptionEn: L(['Smoke from wood and dung-cake chulhas is very harmful to women\'s health. Under Ujjwala an adult woman of a poor family gets a free gas connection in her name — the government pays the connection security deposit.', 'Ujjwala beneficiaries also receive a targeted ₹300 subsidy on domestic cylinders directly in their bank account. The stove and first cylinder are sometimes provided by the oil company in instalments.']),
    eligibility: L(['18 वर्ष से अधिक उम्र की महिला', 'गरीब परिवार — BPL राशन कार्ड / अंत्योदय / अन्य निर्धारित श्रेणी (SC/ST, PMAY, वनवासी, चाय बागान आदि)', 'परिवार में पहले से कोई LPG कनेक्शन न हो']),
    eligibilityEn: L(['Woman above 18 years of age', 'Poor household — BPL ration card / Antyodaya / other notified categories (SC/ST, PMAY, forest dwellers, tea gardens etc.)', 'No existing LPG connection in the household']),
    documentsRequired: L(['आधार कार्ड', 'BPL / राशन कार्ड', 'बैंक पासबुक', 'पासपोर्ट साइज़ फोटो', 'मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'BPL / ration card', 'Bank passbook', 'Passport size photo', 'Mobile number']),
    howToApply: L(['pmuy.gov.in पर "Apply for New Ujjwala 2.0 Connection" चुनें', 'या अपने नज़दीकी LPG वितरक (इंडेन, HP, भारत गैस) के पास जाएं', 'KYC फॉर्म भरें और कागज़ जमा करें', 'सत्यापन के बाद कनेक्शन जारी होता है']),
    howToApplyEn: L(['On pmuy.gov.in choose "Apply for New Ujjwala 2.0 Connection"', 'Or go to your nearest LPG distributor (Indane, HP, Bharat Gas)', 'Fill the KYC form and submit documents', 'The connection is issued after verification']),
    officialLink: 'https://www.pmuy.gov.in',
    faqs: [{ q: 'सब्सिडी कैसे मिलती है?', qEn: 'How is the subsidy paid?', a: 'सिलेंडर बाज़ार भाव पर लेना होता है, फिर सब्सिडी आपके आधार-लिंक बैंक खाते में आ जाती है। इसलिए बैंक खाता आधार से जुड़ा होना चाहिए।', aEn: 'You buy the cylinder at market price and the subsidy then credits to your Aadhaar-linked bank account — so the account must be Aadhaar-seeded.' }]
  }),

  mk('women', {
    slug: 'day-nrlm-jeevika-shg', icon: '👩‍🌾',
    title: 'स्वयं सहायता समूह / लखपति दीदी (DAY-NRLM)', titleEn: 'Self-Help Groups / Lakhpati Didi (DAY-NRLM)',
    ministry: 'ग्रामीण विकास मंत्रालय', ministryEn: 'Ministry of Rural Development',
    oneLineSummary: 'ग्रामीण महिलाओं के लिए समूह बनाकर बिना गारंटी बैंक लोन, ट्रेनिंग और कमाई के अवसर।',
    oneLineSummaryEn: 'Rural women form groups to get collateral-free bank loans, training and income opportunities.',
    benefit: 'समूह को रिवॉल्विंग फंड, कम ब्याज पर बैंक लोन, कारोबार की ट्रेनिंग',
    benefitEn: 'Revolving fund for the group, low-interest bank loans, business training',
    description: L(['राष्ट्रीय ग्रामीण आजीविका मिशन (DAY-NRLM) के तहत गांव की 10-20 गरीब महिलाएं एक स्वयं सहायता समूह (SHG) बनाती हैं, हर महीने थोड़ी बचत करती हैं और आपस में लेन-देन करती हैं। अच्छा रिकॉर्ड होने पर समूह को रिवॉल्विंग फंड और बैंक से कम ब्याज पर लोन मिलता है।', 'बिहार में यह मिशन "जीविका" के नाम से चलता है और "जीविका दीदी" के रूप में लाखों महिलाएं जुड़ी हैं। "लखपति दीदी" का लक्ष्य है कि हर समूह सदस्य सालाना ₹1 लाख या उससे अधिक की आय कमाए — सिलाई, पशुपालन, दुकान, खेती-आधारित कारोबार आदि से।']),
    descriptionEn: L(['Under the National Rural Livelihood Mission (DAY-NRLM) 10-20 poor village women form a Self-Help Group (SHG), save a little every month and lend among themselves. With a good record the group gets a revolving fund and low-interest bank loans.', 'In Bihar the mission runs as "JEEViKA" with lakhs of "Jeevika Didis". The "Lakhpati Didi" goal is for every member to earn ₹1 lakh or more a year — through tailoring, livestock, shops, farm-based business and more.']),
    eligibility: L(['ग्रामीण क्षेत्र की गरीब/ज़रूरतमंद परिवार की महिला', 'आमतौर पर 18 से 60 वर्ष की उम्र की महिलाएं', 'अपने गांव के समूह से जुड़ें या नया समूह बनाएं']),
    eligibilityEn: L(['Woman from a poor/needy household in rural area', 'Generally women aged 18 to 60', 'Join an existing group in your village or form a new one']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'राशन कार्ड', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Ration card', 'Passport size photo']),
    howToApply: L(['अपने गांव की जीविका/NRLM दीदी या ब्लॉक कार्यालय (BPM) से संपर्क करें', 'समूह में शामिल हों या 10-20 महिलाओं का नया समूह बनाएं', 'साप्ताहिक बैठक और बचत शुरू करें, समूह का बैंक खाता खुलवाएं', '3-6 महीने के अच्छे रिकॉर्ड के बाद रिवॉल्विंग फंड और बैंक लोन के लिए आवेदन करें']),
    howToApplyEn: L(['Contact the Jeevika/NRLM didi of your village or the block office', 'Join a group or form a new one of 10-20 women', 'Start weekly meetings and savings; open a group bank account', 'After 3-6 months of good record, apply for revolving fund and bank loan']),
    officialLink: 'https://aajeevika.gov.in',
    faqs: [{ q: 'क्या इसमें जुड़ने के लिए पैसे देने होते हैं?', qEn: 'Do I pay anything to join?', a: 'सरकार की ओर से कोई शुल्क नहीं है। केवल समूह की आपसी साप्ताहिक बचत जमा होती है, जो आपके अपने समूह के खाते में रहती है।', aEn: 'No government fee. Only the group\'s own weekly savings are collected, which stay in your group\'s account.' }]
  }),

  // ───────────────────────── 🎓 STUDENT ─────────────────────────
  mk('student', {
    slug: 'national-scholarship-portal-nsp', icon: '🎓',
    title: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) — केंद्रीय छात्रवृत्तियां', titleEn: 'National Scholarship Portal (NSP) — Central Scholarships',
    ministry: 'शिक्षा मंत्रालय / सामाजिक न्याय मंत्रालय / अल्पसंख्यक कार्य मंत्रालय', ministryEn: 'Ministry of Education / Social Justice / Minority Affairs',
    oneLineSummary: 'SC, ST, OBC, अल्पसंख्यक और गरीब छात्रों के लिए कई छात्रवृत्तियां — एक ही पोर्टल पर आवेदन।',
    oneLineSummaryEn: 'Many scholarships for SC, ST, OBC, minority and poor students — apply on one portal.',
    benefit: 'ट्यूशन/कोर्स फीस और रखरखाव भत्ता (राशि छात्रवृत्ति और कक्षा के अनुसार), सीधे बैंक खाते में',
    benefitEn: 'Tuition/course fee and maintenance allowance (amount varies by scholarship and class), paid to your bank account',
    description: L(['राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) केंद्र सरकार की सैकड़ों छात्रवृत्तियों का एक साझा आवेदन स्थान है। इसमें प्री-मैट्रिक (कक्षा 9-10), पोस्ट-मैट्रिक (कक्षा 11 से आगे), मेरिट-कम-मीन्स और अल्पसंख्यक छात्रवृत्तियां शामिल हैं।', 'पात्रता हर छात्रवृत्ति की अलग है — आमतौर पर पारिवारिक आय की सीमा (जैसे ₹2.5 लाख से ₹8 लाख तक), पिछली परीक्षा में न्यूनतम अंक और वर्ग (SC/ST/OBC/अल्पसंख्यक) देखे जाते हैं। पोर्टल पर "Scholarship Eligibility" से सही योजना खोजें।']),
    descriptionEn: L(['The National Scholarship Portal (scholarships.gov.in) is the common application place for hundreds of central scholarships — pre-matric (classes 9-10), post-matric (class 11 onwards), merit-cum-means and minority scholarships.', 'Eligibility differs for each scholarship — usually a family income limit (₹2.5 lakh to ₹8 lakh depending on the scheme), minimum marks in the previous exam and category (SC/ST/OBC/minority). Use "Scholarship Eligibility" on the portal to find the right one.']),
    eligibility: L(['भारत के नागरिक छात्र, मान्यता प्राप्त स्कूल/कॉलेज में पढ़ रहे', 'योजना के अनुसार पारिवारिक आय सीमा के भीतर', 'पिछली कक्षा में आमतौर पर न्यूनतम 50-60% अंक']),
    eligibilityEn: L(['Indian student studying in a recognised school/college', 'Family income within the limit of the chosen scheme', 'Usually minimum 50-60% marks in previous class']),
    documentsRequired: L(['आधार कार्ड', 'आय प्रमाण पत्र', 'जाति प्रमाण पत्र (यदि लागू हो)', 'पिछली कक्षा की मार्कशीट', 'बैंक पासबुक (आधार-लिंक खाता)', 'संस्था का बोनाफाइड / फीस रसीद']),
    documentsRequiredEn: L(['Aadhaar Card', 'Income certificate', 'Caste certificate (if applicable)', 'Previous class marksheet', 'Bank passbook (Aadhaar-linked account)', 'Institute bonafide / fee receipt']),
    howToApply: L(['scholarships.gov.in पर जाएं → "New Registration" करें', 'अपनी योजना चुनें और आवेदन फॉर्म भरकर कागज़ अपलोड करें', 'फॉर्म फाइनल सबमिट करें और प्रिंट/रसीद संभालें', 'संस्थान और ज़िला/राज्य नोडल अधिकारी सत्यापन करेंगे — स्थिति "Track Application" में देखें']),
    howToApplyEn: L(['Go to scholarships.gov.in → "New Registration"', 'Choose your scheme, fill the form and upload documents', 'Final-submit the form and keep the printout/receipt', 'Your institute and district/state nodal officer will verify — track status under "Track Application"']),
    lastDate: 'हर साल अलग — आमतौर पर पोर्टल जुलाई-अगस्त में खुलता है और आवेदन अक्टूबर-नवंबर तक चलते हैं; पोर्टल पर ताज़ा तारीख देखें',
    lastDateEn: 'Varies yearly — portal usually opens Jul-Aug and applications run till Oct-Nov; check the portal for the latest date',
    officialLink: 'https://scholarships.gov.in',
    faqs: [{ q: 'क्या एक साथ दो छात्रवृत्तियां ले सकते हैं?', qEn: 'Can I take two scholarships together?', a: 'आमतौर पर नहीं — एक समय में एक ही केंद्रीय छात्रवृत्ति मिल सकती है। अपनी पात्रता के हिसाब से सबसे अच्छी योजना चुनें।', aEn: 'Usually no — you can receive only one central scholarship at a time. Pick the best one you are eligible for.' }]
  }),

  mk('student', {
    slug: 'central-sector-scholarship-csss', icon: '🏅',
    title: 'केंद्रीय क्षेत्र छात्रवृत्ति योजना (CSSS)', titleEn: 'Central Sector Scholarship Scheme (CSSS)',
    ministry: 'शिक्षा मंत्रालय', ministryEn: 'Ministry of Education',
    oneLineSummary: 'कक्षा 12 में अच्छे अंक लाने वाले गरीब छात्रों को कॉलेज की पढ़ाई के लिए सालाना वज़ीफ़ा।',
    oneLineSummaryEn: 'Yearly stipend for college for poor students who scored well in class 12.',
    benefit: 'स्नातक के पहले 3 साल ₹12,000 प्रति वर्ष; आगे ₹20,000 प्रति वर्ष (PG/पेशेवर कोर्स)',
    benefitEn: '₹12,000 per year for the first 3 years of graduation; ₹20,000 per year thereafter (PG/professional courses)',
    description: L(['यह योजना कक्षा 12 में अच्छे अंक पाने वाले मेधावी, पर कम आय वाले परिवारों के बच्चों के लिए है ताकि वे कॉलेज की पढ़ाई का खर्च उठा सकें। इसमें राज्य बोर्ड के हिसाब से 80 परसेंटाइल से ऊपर आने वाले छात्र पात्र होते हैं।', 'राशि सीधे छात्र के बैंक खाते में आती है। हर साल नवीनीकरण के लिए पिछले साल की परीक्षा में कम से कम 50% अंक और 75% उपस्थिति चाहिए होती है।']),
    descriptionEn: L(['This scheme is for meritorious students from low-income families who scored well in class 12, to help meet college expenses. Students above the 80th percentile in their board are eligible.', 'The amount comes directly into the student\'s bank account. For yearly renewal you generally need at least 50% marks in the previous year\'s exam and 75% attendance.']),
    eligibility: L(['कक्षा 12 में बोर्ड के 80 परसेंटाइल से ऊपर', 'पारिवारिक वार्षिक आय ₹4.5 लाख तक', 'नियमित स्नातक/प्रोफेशनल कोर्स में दाखिला (पत्राचार/दूरस्थ नहीं)']),
    eligibilityEn: L(['Above 80th percentile of the board in class 12', 'Family annual income up to ₹4.5 lakh', 'Admitted to a regular graduation/professional course (not correspondence/distance)']),
    documentsRequired: L(['आधार कार्ड', 'कक्षा 12 की मार्कशीट', 'आय प्रमाण पत्र', 'कॉलेज में दाखिले का प्रमाण / बोनाफाइड', 'बैंक पासबुक (आधार-लिंक)']),
    documentsRequiredEn: L(['Aadhaar Card', 'Class 12 marksheet', 'Income certificate', 'College admission proof / bonafide', 'Bank passbook (Aadhaar-linked)']),
    howToApply: L(['scholarships.gov.in पर "New Registration" करें', '"Central Sector Scholarship Scheme" चुनकर आवेदन फॉर्म भरें', 'दस्तावेज़ अपलोड कर फाइनल सबमिट करें', 'हर साल "Renewal" के रूप में दोबारा आवेदन करें']),
    howToApplyEn: L(['Do "New Registration" on scholarships.gov.in', 'Choose "Central Sector Scholarship Scheme" and fill the form', 'Upload documents and final-submit', 'Apply again every year as "Renewal"']),
    lastDate: 'हर साल NSP पर घोषित — आमतौर पर अक्टूबर-नवंबर तक',
    lastDateEn: 'Announced yearly on NSP — usually till Oct-Nov',
    officialLink: 'https://scholarships.gov.in',
    faqs: [{ q: 'क्या मैं आवेदन कर सकता/सकती हूं अगर मुझे बहुत कम अंक मिले?', qEn: 'Can I apply with low marks?', a: 'नहीं — इस योजना में कक्षा 12 में बोर्ड के 80 परसेंटाइल से ऊपर होना ज़रूरी है। कम अंक पर दूसरी छात्रवृत्तियां (जैसे वर्ग-आधारित NSP योजनाएं) देखें।', aEn: 'No — you need to be above the 80th percentile in class 12. With lower marks, look at category-based NSP scholarships.' }]
  }),

  mk('student', {
    slug: 'pm-vidyalaxmi-education-loan', icon: '🏦', isNew: true,
    title: 'पीएम-विद्यालक्ष्मी शिक्षा ऋण योजना', titleEn: 'PM-Vidyalaxmi Education Loan Scheme',
    ministry: 'शिक्षा मंत्रालय', ministryEn: 'Ministry of Education',
    oneLineSummary: 'देश के टॉप संस्थानों में दाखिले पर बिना गारंटी, बिना गिरवी शिक्षा ऋण और ब्याज में छूट।',
    oneLineSummaryEn: 'Collateral-free, guarantor-free education loans for top institutions, with interest relief.',
    benefit: 'बिना गारंटी/गिरवी शिक्षा ऋण (सरकारी क्रेडिट गारंटी के साथ); कम आय परिवारों को ब्याज छूट',
    benefitEn: 'Education loan without collateral or guarantor (with government credit guarantee); interest relief for low-income families',
    description: L(['पैसों की कमी के कारण कोई प्रतिभाशाली छात्र उच्च शिक्षा न छोड़े, इसके लिए यह योजना है। इसमें मान्यता प्राप्त शीर्ष उच्च शिक्षण संस्थानों (QHEI) में दाखिला पाने वाले छात्रों को बैंकों से बिना गारंटी और बिना गिरवी लोन मिलता है। ₹7.5 लाख तक के लोन पर सरकार 75% क्रेडिट गारंटी देती है।', 'पारिवारिक आय सीमा के भीतर वाले छात्रों को ब्याज में छूट भी मिलती है। आवेदन के लिए एक ही साझा पोर्टल है जिससे कई बैंकों के विकल्प एक साथ देखे जा सकते हैं।']),
    descriptionEn: L(['This scheme ensures no talented student leaves higher education for lack of money. Students admitted to notified top higher-education institutions (QHEIs) can get bank loans without collateral or guarantor. For loans up to ₹7.5 lakh the government gives a 75% credit guarantee.', 'Students within the family-income limit also get interest relief. There is a single common portal to compare options from several banks together.']),
    eligibility: L(['भारतीय छात्र जिसे सूचीबद्ध टॉप संस्थान (QHEI) में दाखिला मिला हो', 'किसी अन्य केंद्रीय छात्रवृत्ति/ब्याज छूट का लाभ न ले रहा हो', 'ब्याज छूट के लिए परिवार की आय निर्धारित सीमा के भीतर']),
    eligibilityEn: L(['Indian student admitted to a listed top institution (QHEI)', 'Not already availing another central scholarship/interest subsidy', 'Family income within the limit for the interest relief']),
    documentsRequired: L(['आधार कार्ड', 'दाखिले का पत्र और फीस का ब्योरा', 'पिछली कक्षा की मार्कशीट', 'आय प्रमाण पत्र', 'बैंक खाते का विवरण']),
    documentsRequiredEn: L(['Aadhaar Card', 'Admission letter and fee structure', 'Previous class marksheet', 'Income certificate', 'Bank account details']),
    howToApply: L(['pmvidyalaxmi.co.in पर रजिस्ट्रेशन करें', 'साझा शिक्षा ऋण आवेदन फॉर्म (CELAF) भरें', 'अपनी पसंद के बैंक चुनकर आवेदन भेजें और दस्तावेज़ अपलोड करें', 'बैंक की स्वीकृति के बाद ऋण सीधे संस्थान को जारी होता है']),
    howToApplyEn: L(['Register on pmvidyalaxmi.co.in', 'Fill the common education loan application form (CELAF)', 'Choose your preferred banks, apply and upload documents', 'After bank approval the loan is released directly to the institution']),
    officialLink: 'https://www.pmvidyalaxmi.co.in',
    faqs: [{ q: 'क्या मेरा कॉलेज इसमें आता है?', qEn: 'Is my college covered?', a: 'सिर्फ़ चुनिंदा टॉप संस्थान इसमें शामिल हैं। सूची पोर्टल पर देखें; बाकी कॉलेजों के लिए आप सामान्य बैंक शिक्षा ऋण ले सकते हैं।', aEn: 'Only selected top institutions are covered; see the list on the portal. For other colleges you can take a regular bank education loan.' }]
  }),

  // ───────────────────────── 👴 ELDERLY ─────────────────────────
  mk('elder', {
    slug: 'ayushman-vay-vandana-70-plus', icon: '🏥', isNew: true,
    title: 'आयुष्मान वय वंदना कार्ड (70+ वर्ष)', titleEn: 'Ayushman Vay Vandana Card (70+ years)',
    ministry: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय', ministryEn: 'Ministry of Health & Family Welfare',
    oneLineSummary: '70 साल या उससे अधिक उम्र के हर बुज़ुर्ग को आय की परवाह किए बिना ₹5 लाख तक का मुफ़्त इलाज।',
    oneLineSummaryEn: 'Free treatment up to ₹5 lakh for every senior aged 70+, regardless of income.',
    benefit: '₹5 लाख प्रति परिवार प्रति वर्ष तक का कैशलेस इलाज (सूचीबद्ध अस्पतालों में)',
    benefitEn: 'Cashless treatment up to ₹5 lakh per family per year (at empanelled hospitals)',
    description: L(['अक्टूबर 2024 से आयुष्मान भारत PM-JAY का दायरा बढ़ाकर 70 वर्ष या अधिक उम्र के सभी बुज़ुर्गों तक कर दिया गया — चाहे उनकी आय कितनी भी हो। इन्हें अलग "वय वंदना कार्ड" मिलता है।', 'यह कवर परिवार के अन्य सदस्यों से साझा नहीं होता — यानी 70+ बुज़ुर्ग के लिए अलग से ₹5 लाख का कवर रहता है (अगर परिवार में दो बुज़ुर्ग हैं तो ₹5 लाख दोनों में बंटता है)। अस्पताल में भर्ती वाली बीमारियों का इलाज इसमें आता है।']),
    descriptionEn: L(['From October 2024 Ayushman Bharat PM-JAY was extended to all seniors aged 70 years or above, whatever their income. They get a separate "Vay Vandana card".', 'This cover is a separate ₹5 lakh top-up for the senior citizen (if two seniors are in a family, the ₹5 lakh is shared between them). Illnesses requiring hospital admission are covered.']),
    eligibility: L(['उम्र 70 वर्ष या उससे अधिक', 'आय की कोई सीमा नहीं', 'भारत का निवासी (CGHS/ECHS जैसी अन्य सरकारी योजना वाले चाहें तो चुन सकते हैं)']),
    eligibilityEn: L(['Aged 70 years or above', 'No income limit', 'Resident of India (those under CGHS/ECHS etc. can choose either)']),
    documentsRequired: L(['आधार कार्ड', 'मोबाइल नंबर', 'आयु का प्रमाण (आधार पर्याप्त)']),
    documentsRequiredEn: L(['Aadhaar Card', 'Mobile number', 'Age proof (Aadhaar suffices)']),
    howToApply: L(['beneficiary.nha.gov.in पर जाएं या "Ayushman App" डाउनलोड करें', 'आधार से eKYC करके "Vay Vandana" श्रेणी में आवेदन करें', 'या नज़दीकी आयुष्मान मित्र / सूचीबद्ध अस्पताल / CSC से कार्ड बनवाएं', 'कार्ड बनने के बाद सूचीबद्ध अस्पताल में दिखाकर कैशलेस इलाज लें']),
    howToApplyEn: L(['Go to beneficiary.nha.gov.in or download the "Ayushman App"', 'Do Aadhaar eKYC and apply under the "Vay Vandana" category', 'Or get the card made at an Ayushman Mitra / empanelled hospital / CSC', 'After the card is made, show it at an empanelled hospital for cashless treatment']),
    officialLink: 'https://pmjay.gov.in',
    faqs: [{ q: 'क्या पुरानी बीमारी का इलाज भी इसमें होता है?', qEn: 'Are pre-existing diseases covered?', a: 'हां, पहले से मौजूद बीमारियां पहले दिन से कवर होती हैं, लेकिन इलाज अस्पताल में भर्ती वाला होना चाहिए और अस्पताल सूचीबद्ध हो।', aEn: 'Yes, pre-existing conditions are covered from day one, but treatment must need hospital admission at an empanelled hospital.' }]
  }),

  mk('elder', {
    slug: 'indira-gandhi-old-age-pension-nsap', icon: '🧓',
    title: 'वृद्धावस्था पेंशन (NSAP — IGNOAPS)', titleEn: 'Old Age Pension (NSAP — IGNOAPS)',
    ministry: 'ग्रामीण विकास मंत्रालय (राज्य सरकार के साथ)', ministryEn: 'Ministry of Rural Development (with state governments)',
    oneLineSummary: 'गरीब बुज़ुर्गों को हर महीने सीधे बैंक खाते में पेंशन — केंद्र और राज्य दोनों की ओर से।',
    oneLineSummaryEn: 'Monthly pension straight to the bank account of poor seniors — from both Centre and state.',
    benefit: 'केंद्र की ओर से ₹200/माह (60-79 वर्ष), ₹500/माह (80+); राज्य अपनी राशि जोड़ते हैं',
    benefitEn: 'Centre gives ₹200/month (60-79 yrs), ₹500/month (80+); states add their own amount',
    description: L(['इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना (IGNOAPS) गरीबी रेखा से नीचे के बुज़ुर्गों की मदद करती है। केंद्र 60-79 वर्ष के लाभार्थी को ₹200 और 80 वर्ष या अधिक को ₹500 प्रति माह देता है, और लगभग हर राज्य इसमें अपनी राशि जोड़कर बढ़ाकर देता है।', 'बिहार में राज्य सरकार की "मुख्यमंत्री वृद्धजन पेंशन योजना" के तहत पेंशन राशि केंद्र से कहीं ज़्यादा है (जून 2025 से ₹1,100 प्रति माह) — अपने ब्लॉक/पंचायत कार्यालय से ताज़ा राशि और पात्रता की पुष्टि कर लें।']),
    descriptionEn: L(['The Indira Gandhi National Old Age Pension Scheme (IGNOAPS) helps seniors below the poverty line. The Centre pays ₹200 a month to beneficiaries aged 60-79 and ₹500 at 80 or above, and almost every state tops it up.', 'In Bihar the state\'s "Mukhyamantri Vriddhjan Pension Yojana" pays much more than the Centre\'s share (₹1,100 a month since June 2025) — confirm the latest amount and eligibility with your block/panchayat office.']),
    eligibility: L(['उम्र 60 वर्ष या अधिक', 'गरीबी रेखा से नीचे (BPL) / राज्य की पात्रता सूची के अनुसार', 'किसी अन्य पेंशन का लाभ लेने वाले को दोहरा लाभ नहीं (राज्य नियमानुसार)']),
    eligibilityEn: L(['Age 60 years or above', 'Below poverty line (BPL) / as per state eligibility list', 'No double benefit if already receiving another pension (as per state rules)']),
    documentsRequired: L(['आधार कार्ड', 'आयु प्रमाण (जन्म प्रमाण पत्र / मैट्रिक सर्टिफिकेट / आधार)', 'BPL / आय प्रमाण पत्र', 'बैंक पासबुक', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Age proof (birth certificate / matric certificate / Aadhaar)', 'BPL / income certificate', 'Bank passbook', 'Passport size photo']),
    howToApply: L(['अपने पंचायत कार्यालय / ब्लॉक कार्यालय (BDO) में संपर्क करें, या राज्य के समाज कल्याण विभाग का ऑनलाइन पोर्टल देखें', 'पेंशन आवेदन फॉर्म भरें और कागज़ जमा करें', 'सत्यापन और स्वीकृति के बाद पेंशन हर महीने बैंक खाते में आती है', 'हर साल जीवित प्रमाण / सत्यापन की प्रक्रिया पूरी कराएं']),
    howToApplyEn: L(['Contact your panchayat office / block office (BDO), or see your state social welfare department\'s online portal', 'Fill the pension application form and submit documents', 'After verification and approval the pension credits monthly to your bank account', 'Complete the yearly life-certificate / verification']),
    officialLink: 'https://nsap.nic.in',
    faqs: [{ q: 'पेंशन रुक जाए तो क्या करें?', qEn: 'What if my pension stops?', a: 'आम कारण हैं — आधार-बैंक लिंक न होना, वार्षिक सत्यापन छूटना या खाता निष्क्रिय होना। ब्लॉक कार्यालय में जाकर इन्हें ठीक कराएं।', aEn: 'Common reasons are no Aadhaar-bank link, missed yearly verification or an inactive account. Get these fixed at the block office.' }]
  }),

  mk('elder', {
    slug: 'atal-pension-yojana', icon: '🛡️',
    title: 'अटल पेंशन योजना (APY)', titleEn: 'Atal Pension Yojana (APY)',
    ministry: 'वित्त मंत्रालय (PFRDA)', ministryEn: 'Ministry of Finance (PFRDA)',
    oneLineSummary: 'असंगठित क्षेत्र के कामगारों के लिए — 60 साल के बाद ₹1,000 से ₹5,000 तक की पक्की मासिक पेंशन।',
    oneLineSummaryEn: 'For unorganised-sector workers — a guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60.',
    benefit: '60 वर्ष के बाद ₹1,000 / 2,000 / 3,000 / 4,000 / 5,000 मासिक पेंशन (अपनी पसंद के अनुसार)',
    benefitEn: '₹1,000 / 2,000 / 3,000 / 4,000 / 5,000 monthly pension after 60 (as you choose)',
    description: L(['अटल पेंशन योजना में 18 से 40 साल का कोई भी व्यक्ति, जिसके पास बचत बैंक खाता है, मासिक या तिमाही छोटी रकम जमा करके अपने बुढ़ापे के लिए पक्की पेंशन तय कर सकता है। जितनी कम उम्र में जुड़ेंगे, उतनी कम किस्त देनी होगी।', 'किस्त बैंक खाते से अपने आप कट जाती है। 60 साल के बाद चुनी हुई पेंशन मिलती है और व्यक्ति की मृत्यु के बाद पति/पत्नी को वही पेंशन मिलती रहती है, उसके बाद नामित व्यक्ति को जमा राशि लौटाई जाती है।']),
    descriptionEn: L(['Under APY anyone aged 18 to 40 with a savings bank account can fix a guaranteed old-age pension by paying a small amount monthly or quarterly. The younger you join, the smaller the instalment.', 'The instalment is auto-debited from your bank account. After 60 you get the pension you chose; after the subscriber\'s death the spouse continues to get the same pension, and later the nominee gets the accumulated corpus.']),
    eligibility: L(['उम्र 18 से 40 वर्ष', 'बचत बैंक/डाकघर खाता और मोबाइल नंबर', 'आयकर दाता पात्र नहीं']),
    eligibilityEn: L(['Age 18 to 40 years', 'Savings bank/post office account and mobile number', 'Income-tax payers are not eligible']),
    documentsRequired: L(['आधार कार्ड', 'बैंक/डाकघर पासबुक', 'मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank/post office passbook', 'Mobile number']),
    howToApply: L(['अपने बैंक या डाकघर की शाखा में जाएं (या नेट/मोबाइल बैंकिंग से)', 'APY रजिस्ट्रेशन फॉर्म भरें और पेंशन राशि चुनें', 'ऑटो-डेबिट की सहमति दें', 'हर किस्त के लिए खाते में पर्याप्त शेष रखें']),
    howToApplyEn: L(['Visit your bank or post office branch (or use net/mobile banking)', 'Fill the APY registration form and choose the pension amount', 'Give auto-debit consent', 'Keep enough balance in the account for each instalment']),
    officialLink: 'https://www.npscra.nsdl.co.in',
    faqs: [{ q: 'किस्त कितनी बनेगी?', qEn: 'How much will the instalment be?', a: '18 साल में जुड़कर ₹5,000 पेंशन के लिए लगभग ₹210 प्रति माह; उम्र बढ़ने पर किस्त बढ़ती है। सही राशि बैंक से पूछें।', aEn: 'Joining at 18 for a ₹5,000 pension costs about ₹210 a month; it rises with age. Ask your bank for the exact figure.' }]
  }),

  // ───────────────────────── ♿ DISABLED ─────────────────────────
  mk('disability', {
    slug: 'udid-card-swavlamban', icon: '🆔',
    title: 'यूनिक डिसेबिलिटी आईडी (UDID) कार्ड', titleEn: 'Unique Disability ID (UDID) Card',
    ministry: 'दिव्यांगजन सशक्तिकरण विभाग', ministryEn: 'Department of Empowerment of Persons with Disabilities',
    oneLineSummary: 'दिव्यांगजन का एक राष्ट्रीय पहचान-पत्र — सभी सरकारी लाभों के लिए सबसे पहला ज़रूरी कागज़।',
    oneLineSummaryEn: 'A single national ID for persons with disabilities — the first essential document for every government benefit.',
    benefit: 'मुफ़्त राष्ट्रीय दिव्यांग पहचान पत्र — पेंशन, यात्रा रियायत, नौकरी आरक्षण, उपकरण सब में काम आता है',
    benefitEn: 'Free national disability ID — used for pension, travel concession, job reservation and aids',
    description: L(['UDID कार्ड दिव्यांगता का एकमात्र देशव्यापी प्रमाण है। इसमें व्यक्ति की दिव्यांगता का प्रकार और प्रतिशत दर्ज होता है, इसलिए हर बार अलग-अलग विभागों के चक्कर नहीं लगाने पड़ते। इसके बिना ज़्यादातर योजनाओं का लाभ मिलना मुश्किल होता है।', 'पोर्टल पर आवेदन के बाद ज़िला मेडिकल बोर्ड/सरकारी अस्पताल में जांच होती है और कार्ड जारी होता है। कार्ड बनवाना पूरी तरह मुफ़्त है।']),
    descriptionEn: L(['The UDID card is the single nationwide proof of disability. It records the type and percentage of disability, so you do not have to run to different departments every time. Without it, most schemes are hard to access.', 'After applying on the portal you are assessed at a district medical board / government hospital and the card is issued. Getting the card is completely free.']),
    eligibility: L(['निर्धारित 21 प्रकार की दिव्यांगता में से किसी से पीड़ित व्यक्ति', 'आमतौर पर 40% या उससे अधिक दिव्यांगता पर अधिकतर लाभ', 'भारत का नागरिक']),
    eligibilityEn: L(['Person with any of the notified 21 types of disability', 'Most benefits usually need 40% or more disability', 'Indian citizen']),
    documentsRequired: L(['आधार कार्ड', 'पासपोर्ट साइज़ फोटो', 'हस्ताक्षर / अंगूठे का निशान', 'मौजूदा दिव्यांगता प्रमाण पत्र या मेडिकल कागज़ (यदि हों)', 'मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'Passport size photo', 'Signature / thumb impression', 'Existing disability certificate or medical papers (if any)', 'Mobile number']),
    howToApply: L(['swavlambancard.gov.in पर जाएं → "Apply for Disability Certificate & UDID Card"', 'फॉर्म भरें और फोटो, हस्ताक्षर व कागज़ अपलोड करें', 'तय तारीख को ज़िला अस्पताल / मेडिकल बोर्ड में जांच कराएं', 'स्वीकृति के बाद कार्ड डाक से आता है और पोर्टल से डाउनलोड भी होता है']),
    howToApplyEn: L(['Go to swavlambancard.gov.in → "Apply for Disability Certificate & UDID Card"', 'Fill the form and upload photo, signature and documents', 'Get assessed at the district hospital / medical board on the given date', 'After approval the card comes by post and can be downloaded from the portal']),
    officialLink: 'https://www.swavlambancard.gov.in',
    faqs: [{ q: 'क्या पुराना दिव्यांग प्रमाण पत्र बेकार हो जाएगा?', qEn: 'Will my old disability certificate become useless?', a: 'नहीं, पर नई सुविधाओं और देशभर में मान्यता के लिए UDID बनवाना बेहतर है।', aEn: 'No, but getting a UDID is better for new benefits and nationwide recognition.' }]
  }),

  mk('disability', {
    slug: 'disability-pension-ignodps', icon: '💵',
    title: 'दिव्यांग पेंशन (NSAP — IGNDPS)', titleEn: 'Disability Pension (NSAP — IGNDPS)',
    ministry: 'ग्रामीण विकास मंत्रालय (राज्य सरकार के साथ)', ministryEn: 'Ministry of Rural Development (with state governments)',
    oneLineSummary: 'गरीब परिवार के गंभीर दिव्यांगजन को हर महीने पेंशन — केंद्र और राज्य की ओर से।',
    oneLineSummaryEn: 'Monthly pension for severely disabled persons from poor families — from Centre and state.',
    benefit: 'केंद्र की ओर से ₹300/माह (80% या अधिक दिव्यांगता, BPL); राज्य अपनी राशि जोड़ते हैं',
    benefitEn: 'Centre gives ₹300/month (80%+ disability, BPL); states add their own amount',
    description: L(['इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन योजना (IGNDPS) उन दिव्यांगजन के लिए है जो गरीबी रेखा से नीचे हैं और जिनकी दिव्यांगता 80% या उससे अधिक है। केंद्र 18-79 वर्ष के लाभार्थी को ₹300 प्रति माह देता है, और राज्य अपनी ओर से राशि जोड़ते हैं।', 'अलग-अलग राज्यों में दिव्यांगता के प्रतिशत और पात्रता के नियम थोड़े अलग हो सकते हैं, इसलिए अपने राज्य के समाज कल्याण विभाग से पुष्टि कर लें।']),
    descriptionEn: L(['The Indira Gandhi National Disability Pension Scheme (IGNDPS) is for persons below the poverty line with 80% or higher disability. The Centre pays ₹300 a month to beneficiaries aged 18-79 and states add their own amount.', 'Disability-percentage and eligibility rules can differ slightly across states, so confirm with your state social welfare department.']),
    eligibility: L(['उम्र 18 से 79 वर्ष', 'गंभीर या बहु-दिव्यांगता — 80% या अधिक', 'गरीबी रेखा से नीचे (BPL) परिवार']),
    eligibilityEn: L(['Age 18 to 79 years', 'Severe or multiple disability — 80% or more', 'Below poverty line (BPL) household']),
    documentsRequired: L(['दिव्यांगता प्रमाण पत्र / UDID कार्ड', 'आधार कार्ड', 'BPL / आय प्रमाण पत्र', 'बैंक पासबुक', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Disability certificate / UDID card', 'Aadhaar Card', 'BPL / income certificate', 'Bank passbook', 'Passport size photo']),
    howToApply: L(['अपने पंचायत/ब्लॉक कार्यालय या राज्य के समाज कल्याण विभाग में संपर्क करें', 'पेंशन आवेदन फॉर्म भरें और दिव्यांगता प्रमाण पत्र समेत कागज़ जमा करें', 'सत्यापन के बाद पेंशन हर महीने सीधे बैंक खाते में आती है']),
    howToApplyEn: L(['Contact your panchayat/block office or the state social welfare department', 'Fill the pension application form and submit documents including the disability certificate', 'After verification the pension credits monthly straight to your bank account']),
    officialLink: 'https://nsap.nic.in',
    faqs: [{ q: '40% दिव्यांगता पर क्या पेंशन मिलेगी?', qEn: 'Is pension given for 40% disability?', a: 'केंद्रीय IGNDPS में 80% ज़रूरी है, पर कई राज्यों की अपनी दिव्यांग पेंशन योजनाएं 40% पर भी लाभ देती हैं। अपने राज्य की योजना देखें।', aEn: 'Central IGNDPS needs 80%, but many states have their own disability pension schemes that pay at 40% too. Check your state\'s scheme.' }]
  }),

  mk('disability', {
    slug: 'adip-free-assistive-devices', icon: '🦽',
    title: 'ADIP योजना — मुफ़्त सहायक उपकरण', titleEn: 'ADIP Scheme — Free Assistive Devices',
    ministry: 'दिव्यांगजन सशक्तिकरण विभाग', ministryEn: 'Department of Empowerment of Persons with Disabilities',
    oneLineSummary: 'व्हीलचेयर, ट्राइसाइकिल, कृत्रिम अंग, श्रवण यंत्र जैसे उपकरण मुफ़्त या भारी छूट पर।',
    oneLineSummaryEn: 'Wheelchairs, tricycles, artificial limbs, hearing aids and more — free or at a heavy discount.',
    benefit: 'मासिक आय ₹15,000 तक वालों को पूरा खर्च सरकार देती है; ₹15,001–₹22,500 तक वालों को 50% छूट',
    benefitEn: 'Full cost borne by government for monthly income up to ₹15,000; 50% subsidy for ₹15,001–₹22,500',
    description: L(['ADIP (दिव्यांगजन को सहायक उपकरण/यंत्र की खरीद/फिटिंग में सहायता) योजना के तहत दिव्यांगजन को उनकी ज़रूरत के हिसाब से व्हीलचेयर, बैसाखी, ट्राइसाइकिल, कृत्रिम अंग, कैलिपर, श्रवण यंत्र, ब्रेल किट, स्मार्ट केन आदि दिए जाते हैं।', 'ये उपकरण आमतौर पर ALIMCO द्वारा आयोजित शिविरों या ज़िला दिव्यांग पुनर्वास केंद्र (DDRC) में दिए जाते हैं। पहले दिव्यांगता का आकलन होता है और फिर सही उपकरण का नाप/फिटिंग की जाती है।']),
    descriptionEn: L(['Under ADIP, persons with disabilities get aids matched to their need — wheelchairs, crutches, tricycles, artificial limbs, callipers, hearing aids, Braille kits, smart canes and more.', 'These are usually given at camps organised by ALIMCO or at the District Disability Rehabilitation Centre (DDRC). First the disability is assessed, then the correct aid is measured and fitted.']),
    eligibility: L(['भारतीय नागरिक, 40% या अधिक दिव्यांगता', 'मासिक आय ₹22,500 तक', 'पिछले 3 साल में (बच्चों के लिए 1 साल में) वही उपकरण न लिया हो']),
    eligibilityEn: L(['Indian citizen with 40% or more disability', 'Monthly income up to ₹22,500', 'Not received the same aid in last 3 years (1 year for children)']),
    documentsRequired: L(['दिव्यांगता प्रमाण पत्र / UDID कार्ड', 'आधार कार्ड', 'आय प्रमाण पत्र', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Disability certificate / UDID card', 'Aadhaar Card', 'Income certificate', 'Passport size photo']),
    howToApply: L(['अपने ज़िले के DDRC / समाज कल्याण कार्यालय या ज़िला प्रशासन से ALIMCO शिविर की तारीख पूछें', 'शिविर में दिव्यांगता का आकलन कराएं', 'ज़रूरी कागज़ और आवेदन जमा करें', 'चयनित होने पर उपकरण मुफ़्त/छूट पर शिविर में ही या कुछ दिन बाद मिलता है']),
    howToApplyEn: L(['Ask your district DDRC / social welfare office or district administration for ALIMCO camp dates', 'Get your disability assessed at the camp', 'Submit the application and required documents', 'If selected, the aid is given free/subsidised at the camp or a few days later']),
    officialLink: 'https://disabilityaffairs.gov.in',
    faqs: [{ q: 'क्या बच्चों के लिए भी उपकरण मिलते हैं?', qEn: 'Are aids given for children too?', a: 'हां, बच्चों के लिए भी उपकरण मिलते हैं और बच्चे के बढ़ने के हिसाब से जल्दी बदलवाए जा सकते हैं।', aEn: 'Yes, children get aids too and they can be replaced sooner as the child grows.' }]
  })

  );
})();
