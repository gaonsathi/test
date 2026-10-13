// ======================================================================
//  STATIC SCHEMES — 🏥 स्वास्थ्य, 🏠 आवास, 💼 रोज़गार, 🍚 राशन/कल्याण
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

  // ───────────────────────── 🏥 HEALTH ─────────────────────────
  mk('health', {
    slug: 'ayushman-bharat-pm-jay', icon: '🏥',
    title: 'आयुष्मान भारत — पीएम-जेएवाई (गोल्डन कार्ड)', titleEn: 'Ayushman Bharat — PM-JAY (Golden Card)',
    ministry: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय', ministryEn: 'Ministry of Health & Family Welfare',
    oneLineSummary: 'गरीब और कमज़ोर परिवारों को हर साल ₹5 लाख तक का मुफ़्त, कैशलेस इलाज।',
    oneLineSummaryEn: 'Free, cashless treatment up to ₹5 lakh every year for poor and vulnerable families.',
    benefit: '₹5 लाख प्रति परिवार प्रति वर्ष तक अस्पताल में भर्ती का मुफ़्त इलाज',
    benefitEn: 'Free in-hospital treatment up to ₹5 lakh per family per year',
    description: L(['आयुष्मान भारत PM-JAY दुनिया की सबसे बड़ी सरकारी स्वास्थ्य बीमा योजनाओं में से एक है। इसमें सूचीबद्ध सरकारी और निजी अस्पतालों में भर्ती होकर होने वाले इलाज — ऑपरेशन, कैंसर, हृदय रोग, डायलिसिस आदि — का पूरा खर्च ₹5 लाख तक सरकार उठाती है। परिवार के आकार या उम्र की कोई सीमा नहीं है।', 'पात्र परिवारों की सूची सामाजिक-आर्थिक जनगणना (SECC 2011) और राज्य द्वारा जोड़े गए वर्गों पर आधारित है। आप mera.pmjay.gov.in पर अपना नाम जांच सकते हैं और कार्ड (Golden Card / आयुष्मान कार्ड) बनवाकर अस्पताल में दिखाकर बिना पैसा दिए इलाज करा सकते हैं।']),
    descriptionEn: L(['Ayushman Bharat PM-JAY is among the world\'s largest government health-insurance schemes. At empanelled government and private hospitals, the full cost of hospital-admission treatment — surgery, cancer, heart disease, dialysis etc. — up to ₹5 lakh is borne by the government. There is no limit on family size or age.', 'Eligible families are drawn from the Socio-Economic Caste Census (SECC 2011) and categories added by states. You can check your name at mera.pmjay.gov.in, make the Ayushman card (Golden Card) and show it at the hospital for treatment without paying.']),
    eligibility: L(['SECC 2011 या राज्य की सूची में नाम वाले परिवार (कच्चे घर, भूमिहीन मज़दूर, SC/ST आदि)', 'कुछ राज्यों में राशन कार्ड धारक भी पात्र', 'आय या उम्र की कोई सीमा नहीं; सरकारी कर्मचारी (अन्य योजना वाले) पात्र नहीं']),
    eligibilityEn: L(['Families named in SECC 2011 or the state list (kutcha house, landless labour, SC/ST etc.)', 'In some states ration-card holders are eligible too', 'No age or family-size limit; government employees covered under another scheme are not eligible']),
    documentsRequired: L(['आधार कार्ड', 'राशन कार्ड', 'मोबाइल नंबर', 'परिवार के सदस्यों का विवरण']),
    documentsRequiredEn: L(['Aadhaar Card', 'Ration card', 'Mobile number', 'Details of family members']),
    howToApply: L(['mera.pmjay.gov.in पर मोबाइल नंबर से अपनी पात्रता जांचें', 'नज़दीकी CSC, आयुष्मान मित्र या सूचीबद्ध अस्पताल में आधार और राशन कार्ड लेकर जाएं', 'या "Ayushman App" से आधार eKYC करके खुद कार्ड बनाएं', 'कार्ड बनने के बाद सूचीबद्ध अस्पताल के आयुष्मान मित्र को दिखाकर कैशलेस इलाज करवाएं']),
    howToApplyEn: L(['Check eligibility on mera.pmjay.gov.in with your mobile number', 'Go to a nearby CSC, Ayushman Mitra or empanelled hospital with Aadhaar and ration card', 'Or make the card yourself in the "Ayushman App" using Aadhaar eKYC', 'After the card is made, show it to the Ayushman Mitra at an empanelled hospital for cashless treatment']),
    officialLink: 'https://pmjay.gov.in',
    faqs: [{ q: 'क्या OPD (बिना भर्ती वाला इलाज) और दवाइयां भी इसमें आती हैं?', qEn: 'Are OPD and medicines covered?', a: 'मुख्य रूप से अस्पताल में भर्ती वाला इलाज कवर होता है — भर्ती से पहले/बाद के कुछ खर्च भी शामिल हैं। सामान्य OPD के लिए जन औषधि केंद्र से सस्ती दवा लें।', aEn: 'Mainly in-hospital treatment is covered, including some pre/post-admission costs. For regular OPD buy cheap medicines at a Jan Aushadhi Kendra.' }]
  }),

  mk('health', {
    slug: 'jan-aushadhi-kendra', icon: '💊',
    title: 'प्रधानमंत्री जन औषधि योजना', titleEn: 'PM Bhartiya Janaushadhi Pariyojana',
    ministry: 'रसायन एवं उर्वरक मंत्रालय (फार्मास्युटिकल्स विभाग)', ministryEn: 'Ministry of Chemicals & Fertilizers (Dept. of Pharmaceuticals)',
    oneLineSummary: 'जन औषधि केंद्र पर वही गुणवत्ता की जेनेरिक दवाइयां बाज़ार से 50% से 80% तक सस्ती।',
    oneLineSummaryEn: 'Same-quality generic medicines at Jan Aushadhi Kendras, 50% to 80% cheaper than the market.',
    benefit: 'ब्रांडेड दवाओं की तुलना में 50–80% तक सस्ती दवाएं',
    benefitEn: 'Medicines 50–80% cheaper than branded ones',
    description: L(['ब्रांडेड दवाओं की ऊंची कीमत गरीब परिवार की सबसे बड़ी चिंता होती है, खासकर शुगर, बीपी, थायरॉइड जैसी रोज़ की दवाओं में। जन औषधि केंद्रों पर वही असर वाली जेनेरिक दवाएं, जिन्हें सरकार की जांच-प्रक्रिया से गुज़ारा जाता है, बहुत कम दाम पर मिलती हैं।', 'देशभर में हज़ारों जन औषधि केंद्र हैं। अपना नज़दीकी केंद्र जनऔषधि सुगम ऐप से खोज सकते हैं। यही नहीं, कोई भी बेरोज़गार फार्मासिस्ट या उद्यमी अपना जन औषधि केंद्र खोलकर कमाई भी कर सकता है।']),
    descriptionEn: L(['The high price of branded medicines is a big worry for poor families, especially for daily medicines for sugar, BP and thyroid. At Jan Aushadhi Kendras the same-effect generic medicines, tested under a government quality process, are sold at much lower prices.', 'There are thousands of Jan Aushadhi Kendras across India; find the nearest one in the Janaushadhi Sugam app. Any unemployed pharmacist or entrepreneur can also open a Kendra and earn from it.']),
    eligibility: L(['दवा खरीदने के लिए कोई भी व्यक्ति', 'केंद्र खोलने के लिए: फार्मासिस्ट (D.Pharm/B.Pharm) या उसे नियुक्त करने वाला उद्यमी, स्वयं सहायता समूह, NGO']),
    eligibilityEn: L(['Anyone can buy medicines', 'To open a Kendra: pharmacist (D.Pharm/B.Pharm) or entrepreneur employing one, SHG, NGO']),
    documentsRequired: L(['डॉक्टर की पर्ची (दवा खरीदने के लिए)', 'केंद्र खोलने के लिए: फार्मासिस्ट का रजिस्ट्रेशन, पता प्रमाण, जगह के कागज़, आधार, पैन']),
    documentsRequiredEn: L(['Doctor\'s prescription (to buy medicines)', 'To open a Kendra: pharmacist registration, address proof, premises papers, Aadhaar, PAN']),
    howToApply: L(['नज़दीकी जन औषधि केंद्र पर डॉक्टर की पर्ची दिखाएं और जेनेरिक नाम की दवा मांगें', 'डॉक्टर से पर्ची पर दवा का जेनेरिक नाम (नमक का नाम) लिखवाएं', 'केंद्र खोलना चाहें तो janaushadhi.gov.in पर आवेदन करें']),
    howToApplyEn: L(['Show the prescription at the nearest Jan Aushadhi Kendra and ask for the generic version', 'Ask your doctor to write the generic (salt) name on the prescription', 'To open a Kendra, apply on janaushadhi.gov.in']),
    officialLink: 'https://janaushadhi.gov.in',
    faqs: [{ q: 'क्या जेनेरिक दवा भी उतनी ही असरदार होती है?', qEn: 'Are generic medicines equally effective?', a: 'हां, उनमें वही सक्रिय तत्व और मात्रा होती है; फ़र्क सिर्फ़ ब्रांड और विज्ञापन के खर्च का होता है। फिर भी कोई शंका हो तो अपने डॉक्टर से पूछ लें।', aEn: 'Yes, they have the same active ingredient and strength; the difference is only brand and advertising cost. If in doubt, ask your doctor.' }]
  }),

  mk('health', {
    slug: 'pm-surakshit-matritva-abhiyan', icon: '🤰',
    title: 'प्रधानमंत्री सुरक्षित मातृत्व अभियान (PMSMA)', titleEn: 'PM Surakshit Matritva Abhiyan (PMSMA)',
    ministry: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय', ministryEn: 'Ministry of Health & Family Welfare',
    oneLineSummary: 'हर महीने की 9 तारीख को सरकारी अस्पताल में गर्भवती महिलाओं की मुफ़्त जांच, डॉक्टर के साथ।',
    oneLineSummaryEn: 'Free antenatal check-up with a doctor for pregnant women at government hospitals on the 9th of every month.',
    benefit: 'हर महीने की 9 तारीख को विशेषज्ञ डॉक्टर से मुफ़्त जांच, जांच-रिपोर्ट और सलाह',
    benefitEn: 'Free check-up, tests and advice from a specialist doctor on the 9th of every month',
    description: L(['गर्भावस्था के दौरान समय पर जांच से कई जोखिम पहले ही पकड़ में आ जाते हैं। इस अभियान में हर महीने की 9 तारीख को सभी सरकारी स्वास्थ्य केंद्रों पर प्रसूति रोग विशेषज्ञ गर्भवती महिलाओं की निश्चित मुफ़्त जांच करते हैं — खासकर दूसरी और तीसरी तिमाही में।', 'अगर किसी महिला को उच्च जोखिम वाली गर्भावस्था (जैसे कम खून, उच्च रक्तचाप) निकलती है तो उसे विशेष निगरानी और ज़रूरत पर बड़े अस्पताल भेजने की व्यवस्था होती है।']),
    descriptionEn: L(['Timely check-ups in pregnancy catch many risks early. Under this campaign, on the 9th of every month obstetricians at government health facilities provide free assured check-ups for pregnant women — especially in the second and third trimesters.', 'If a woman is found to have a high-risk pregnancy (such as severe anaemia or high blood pressure) she is given special monitoring and referred to a bigger hospital when needed.']),
    eligibility: L(['सभी गर्भवती महिलाएं', 'कोई आय सीमा या वर्ग की शर्त नहीं']),
    eligibilityEn: L(['All pregnant women', 'No income or category condition']),
    documentsRequired: L(['MCP कार्ड (यदि बना हो)', 'आधार कार्ड', 'पिछली जांच की रिपोर्ट (यदि हो)']),
    documentsRequiredEn: L(['MCP card (if available)', 'Aadhaar Card', 'Earlier check-up reports (if any)']),
    howToApply: L(['हर महीने की 9 तारीख को नज़दीकी सरकारी अस्पताल / PHC / CHC जाएं', 'आशा या एएनएम दीदी से गर्भावस्था पंजीकरण करा लें', 'जांच के बाद डॉक्टर की सलाह और दवा/आयरन-कैल्शियम गोलियां लें']),
    howToApplyEn: L(['Visit the nearest government hospital / PHC / CHC on the 9th of every month', 'Register the pregnancy with your ASHA or ANM didi', 'After the check-up take the doctor\'s advice and iron-calcium tablets']),
    lastDate: 'हर महीने की 9 तारीख', lastDateEn: '9th of every month',
    officialLink: 'https://pmsma.mohfw.gov.in',
    faqs: [{ q: '9 तारीख को रविवार या छुट्टी हो तो?', qEn: 'What if the 9th is a Sunday or holiday?', a: 'तब आमतौर पर अगले कार्य-दिवस पर जांच होती है। अपनी आशा/एएनएम से तारीख पक्की कर लें।', aEn: 'The check-up is then usually held on the next working day. Confirm the date with your ASHA/ANM.' }]
  }),

  // ───────────────────────── 🏠 HOUSING ─────────────────────────
  mk('housing', {
    slug: 'pm-awas-yojana-gramin', icon: '🏠',
    title: 'प्रधानमंत्री आवास योजना — ग्रामीण (PMAY-G)', titleEn: 'PM Awas Yojana — Gramin (PMAY-G)',
    ministry: 'ग्रामीण विकास मंत्रालय', ministryEn: 'Ministry of Rural Development',
    oneLineSummary: 'कच्चे घर या बेघर ग्रामीण परिवारों को पक्का मकान बनाने के लिए ₹1.20 लाख की सहायता।',
    oneLineSummaryEn: '₹1.20 lakh help for rural families with kutcha houses or no house to build a pucca home.',
    benefit: 'मैदानी इलाकों में ₹1.20 लाख, पहाड़ी/दुर्गम इलाकों में ₹1.30 लाख, शौचालय के लिए ₹12,000 अलग',
    benefitEn: '₹1.20 lakh in plains, ₹1.30 lakh in hilly/difficult areas, plus ₹12,000 separately for a toilet',
    description: L(['PMAY-G का मकसद है कि 2029 तक हर ग्रामीण परिवार के पास पक्का मकान हो। सहायता राशि तीन-चार किस्तों में सीधे लाभार्थी के बैंक खाते में आती है और काम की प्रगति (नींव, दीवार, छत) के अनुसार जारी होती है। मकान कम से कम 25 वर्ग मीटर का और उसमें रसोई की जगह होनी चाहिए।', 'लाभार्थियों का चयन सामाजिक-आर्थिक जनगणना 2011 और आवास प्लस सर्वे की सूची से ग्राम सभा की मंज़ूरी के बाद होता है। शौचालय के लिए स्वच्छ भारत मिशन से ₹12,000 और मनरेगा/ग्रामीण रोज़गार योजना में 90-95 दिन की मज़दूरी भी मिलती है।']),
    descriptionEn: L(['PMAY-G aims for every rural family to have a pucca house by 2029. Assistance comes in three-four instalments straight into the beneficiary\'s bank account, released with progress of work (foundation, wall, roof). The house must be at least 25 sq m and include a cooking space.', 'Beneficiaries are chosen from the SECC 2011 and Awaas+ survey lists after Gram Sabha approval. ₹12,000 for a toilet comes from the Swachh Bharat Mission and 90-95 days of wages are also available under the rural employment scheme.']),
    eligibility: L(['बेघर या कच्चे/टूटे-फूटे एक-दो कमरों के घर में रहने वाले परिवार', 'SECC / आवास प्लस सूची में नाम', 'परिवार के पास पक्का मकान, वाहन, किसान क्रेडिट कार्ड (₹50,000+ सीमा) आदि न हो — नियम के अनुसार']),
    eligibilityEn: L(['Families with no house or living in kutcha/dilapidated one-two room houses', 'Name in SECC / Awaas+ list', 'No pucca house, vehicle or high-limit KCC etc. — as per norms']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'जॉब कार्ड', 'ज़मीन का कागज़ / मकान बनाने की जगह का प्रमाण', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Job card', 'Land paper / proof of site for the house', 'Passport size photo']),
    howToApply: L(['अपनी ग्राम पंचायत / पंचायत सचिव या ब्लॉक कार्यालय (BDO) में संपर्क करें', 'देखें कि आपका नाम आवास प्लस / PMAY-G की सूची में है — pmayg.nic.in पर "Stakeholders → IAY/PMAYG Beneficiary" में जांचें', 'नाम न हो तो आवास प्लस सर्वे में नाम जुड़वाने की पूछताछ करें', 'स्वीकृति मिलने पर घर की नींव की फोटो (जियो-टैग) खींचें और किस्तें लें']),
    howToApplyEn: L(['Contact your Gram Panchayat / Panchayat Secretary or block office (BDO)', 'Check your name in the Awaas+ / PMAY-G list at pmayg.nic.in under "Stakeholders → IAY/PMAYG Beneficiary"', 'If missing, ask about getting your name added in the Awaas+ survey', 'After sanction, take geo-tagged photos of the foundation and receive instalments']),
    officialLink: 'https://pmayg.nic.in',
    faqs: [{ q: 'क्या मकान बनवाने के लिए रिश्वत देनी होती है?', qEn: 'Do I need to pay a bribe to get a house?', a: 'नहीं। पूरा पैसा बैंक खाते में आता है। कोई भी पैसे मांगे तो ब्लॉक कार्यालय या ज़िलाधिकारी से शिकायत करें।', aEn: 'No. All money comes to your bank account. If anyone asks for money, complain to the block office or District Magistrate.' }]
  }),

  mk('housing', {
    slug: 'pm-surya-ghar-muft-bijli', icon: '☀️', isNew: true,
    title: 'पीएम सूर्य घर: मुफ़्त बिजली योजना', titleEn: 'PM Surya Ghar: Muft Bijli Yojana',
    ministry: 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय', ministryEn: 'Ministry of New & Renewable Energy',
    oneLineSummary: 'घर की छत पर सोलर पैनल लगवाएं — भारी सब्सिडी और हर महीने 300 यूनिट तक मुफ़्त बिजली।',
    oneLineSummaryEn: 'Install rooftop solar at home — heavy subsidy and up to 300 units of free electricity a month.',
    benefit: '₹30,000 प्रति kW (2 kW तक) और तीसरे kW पर ₹18,000 — कुल अधिकतम ₹78,000 सब्सिडी',
    benefitEn: '₹30,000 per kW up to 2 kW and ₹18,000 for the 3rd kW — maximum ₹78,000 subsidy',
    description: L(['इस योजना में आवासीय उपभोक्ता अपने घर की छत पर सोलर पैनल लगवाकर अपनी बिजली खुद बनाते हैं। 1 kW पर ₹30,000, 2 kW पर ₹60,000 और 3 kW या उससे अधिक पर अधिकतम ₹78,000 की केंद्र सरकार सब्सिडी सीधे बैंक खाते में आती है। अक्सर सस्ता बैंक लोन भी मिल जाता है।', 'औसतन 3 kW का सिस्टम महीने में 300 यूनिट के आसपास बिजली बनाता है — यानी बिजली का बिल लगभग शून्य हो सकता है और बची बिजली बिजली कंपनी को बेचकर कमाई भी हो सकती है।']),
    descriptionEn: L(['Under this scheme residential consumers generate their own power with solar panels on their rooftop. Central subsidy of ₹30,000 for 1 kW, ₹60,000 for 2 kW and up to ₹78,000 for 3 kW or more comes straight into your bank account. A low-cost bank loan is often available too.', 'A 3 kW system produces roughly 300 units a month — so your electricity bill can drop to near zero, and surplus power can be sold to the discom for extra income.']),
    eligibility: L(['अपना घर और उसकी छत हो, जो सोलर लगाने लायक हो', 'वैध बिजली कनेक्शन (घरेलू) हो', 'पहले उसी छत पर सोलर सब्सिडी न ली हो']),
    eligibilityEn: L(['Own house with a roof suitable for solar', 'Valid residential electricity connection', 'No earlier solar subsidy taken for the same roof']),
    documentsRequired: L(['बिजली बिल (उपभोक्ता नंबर)', 'आधार कार्ड', 'बैंक पासबुक / रद्द चेक', 'मोबाइल नंबर और ईमेल']),
    documentsRequiredEn: L(['Electricity bill (consumer number)', 'Aadhaar Card', 'Bank passbook / cancelled cheque', 'Mobile number and email']),
    howToApply: L(['pmsuryaghar.gov.in पर "Apply for Rooftop Solar" चुनें', 'राज्य, बिजली कंपनी और उपभोक्ता नंबर भरकर रजिस्टर करें', 'पोर्टल पर सूचीबद्ध वेंडर चुनकर सोलर लगवाएं', 'नेट मीटर और निरीक्षण के बाद पोर्टल पर बैंक विवरण दें — सब्सिडी 30 दिन के भीतर खाते में आती है']),
    howToApplyEn: L(['On pmsuryaghar.gov.in choose "Apply for Rooftop Solar"', 'Register with state, discom and consumer number', 'Choose a listed vendor on the portal and get solar installed', 'After net meter and inspection, submit bank details on the portal — subsidy credits within about 30 days']),
    officialLink: 'https://pmsuryaghar.gov.in',
    faqs: [{ q: 'कितने kW का सिस्टम लगाना चाहिए?', qEn: 'What capacity should I install?', a: 'औसतन 100 यूनिट महीने के उपयोग पर 1 kW, 200 यूनिट पर 2 kW और 300 यूनिट पर 3 kW काफ़ी रहता है — अपने बिल के हिसाब से चुनें।', aEn: 'Roughly 1 kW for 100 units/month, 2 kW for 200 and 3 kW for 300 — choose according to your bill.' }]
  }),

  mk('housing', {
    slug: 'pm-awas-yojana-urban-2', icon: '🏢',
    title: 'प्रधानमंत्री आवास योजना — शहरी 2.0 (PMAY-U 2.0)', titleEn: 'PM Awas Yojana — Urban 2.0 (PMAY-U 2.0)',
    ministry: 'आवास एवं शहरी कार्य मंत्रालय', ministryEn: 'Ministry of Housing & Urban Affairs',
    oneLineSummary: 'शहरी गरीब और मध्यम वर्ग को अपना घर बनाने या खरीदने के लिए सरकारी सहायता।',
    oneLineSummaryEn: 'Government help for the urban poor and middle class to build or buy their own home.',
    benefit: 'अपना मकान बनाने पर ₹2.5 लाख तक की केंद्रीय सहायता; होम लोन पर ब्याज सब्सिडी',
    benefitEn: 'Central assistance up to ₹2.5 lakh to build your own house; interest subsidy on home loans',
    description: L(['PMAY-U 2.0 शहरी क्षेत्र की एक करोड़ नए परिवारों को घर देने का लक्ष्य रखती है। इसमें कमज़ोर वर्ग (EWS), निम्न आय वर्ग (LIG) और मध्यम आय वर्ग (MIG) के परिवार आते हैं। अपनी ज़मीन पर मकान बनाने (BLC), किफ़ायती मकान की खरीद (AHP), किराये के मकान (ARH) और होम लोन पर ब्याज सब्सिडी (ISS) जैसे अलग-अलग विकल्प हैं।', 'अगर आप शहर में रहते हैं या गांव से शहर में बसने वाले हैं तो अपने नगर निकाय या बैंक से पता करें कि आपके लिए कौन-सा घटक लागू है, क्योंकि पात्रता आय, शहर और घर के प्रकार पर निर्भर करती है।']),
    descriptionEn: L(['PMAY-U 2.0 aims to give homes to one crore urban families. It covers Economically Weaker Section (EWS), Low Income Group (LIG) and Middle Income Group (MIG) households. Options include building on your own plot (BLC), buying an affordable house (AHP), rental housing (ARH) and interest subsidy on home loans (ISS).', 'If you live in a city or are moving from village to city, check with your municipal body or bank which component applies, as eligibility depends on income, city and house type.']),
    eligibility: L(['शहरी परिवार जिनके पास देश में कहीं भी पक्का मकान नहीं है', 'EWS, LIG और MIG आय वर्ग के परिवार (वार्षिक आय के आधार पर)', 'परिवार की महिला सदस्य के नाम या संयुक्त नाम पर मकान']),
    eligibilityEn: L(['Urban families without a pucca house anywhere in India', 'Families in EWS, LIG and MIG income groups (by annual income)', 'House in the name of a female family member or jointly']),
    documentsRequired: L(['आधार कार्ड', 'आय प्रमाण / स्व-घोषणा', 'बैंक पासबुक', 'ज़मीन का कागज़ (BLC के लिए)', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Income proof / self-declaration', 'Bank passbook', 'Land paper (for BLC)', 'Passport size photo']),
    howToApply: L(['pmay-urban.gov.in पर "Apply for PMAY-U 2.0" चुनें', 'आधार, आय और परिवार का विवरण भरें', 'या नज़दीकी नगर निगम/नगर पालिका कार्यालय, CSC या बैंक में आवेदन करें', 'पात्र पाए जाने पर सहायता किस्तों में खाते में आती है']),
    howToApplyEn: L(['On pmay-urban.gov.in choose "Apply for PMAY-U 2.0"', 'Fill Aadhaar, income and family details', 'Or apply at the nearest municipal office, CSC or bank', 'If found eligible, assistance comes in instalments to your account']),
    officialLink: 'https://pmay-urban.gov.in',
    faqs: [{ q: 'गांव वालों के लिए क्या यह लागू है?', qEn: 'Does this apply to villagers?', a: 'नहीं, गांव के लिए PMAY-ग्रामीण है। PMAY-U सिर्फ़ अधिसूचित शहरी क्षेत्रों के लिए है।', aEn: 'No, villages are covered under PMAY-Gramin. PMAY-U is only for notified urban areas.' }]
  }),

  // ───────────────────────── 💼 JOBS & BUSINESS ─────────────────────────
  mk('employment', {
    slug: 'vb-g-ram-g-rural-employment', icon: '⛏️', isNew: true,
    title: 'ग्रामीण रोज़गार गारंटी — VB-G RAM G (मनरेगा की जगह)', titleEn: 'Rural Employment Guarantee — VB-G RAM G (replaces MGNREGA)',
    ministry: 'ग्रामीण विकास मंत्रालय', ministryEn: 'Ministry of Rural Development',
    oneLineSummary: 'ग्रामीण परिवार को साल में 125 दिन के काम की गारंटी — 1 जुलाई 2026 से मनरेगा की जगह नया कानून।',
    oneLineSummaryEn: 'Guaranteed 125 days of work a year for rural families — new law replacing MGNREGA from 1 July 2026.',
    benefit: 'हर ग्रामीण परिवार को साल में 125 दिन तक अकुशल मज़दूरी का रोज़गार',
    benefitEn: 'Up to 125 days a year of unskilled wage work for every rural household',
    description: L(['1 जुलाई 2026 से मनरेगा (MGNREGA) की जगह विकसित भारत — रोज़गार और आजीविका गारंटी मिशन (ग्रामीण), यानी VB-G RAM G अधिनियम 2025 लागू हो गया है। अब हर उस ग्रामीण परिवार को, जिसके वयस्क सदस्य अकुशल शारीरिक काम करना चाहते हैं, साल में 125 दिन के मज़दूरी वाले काम की गारंटी है (पहले 100 दिन थी)।', 'काम गांव में ही मिलता है — सड़क, तालाब, सिंचाई, जल संरक्षण जैसे कामों में। मज़दूरी सीधे बैंक खाते में आती है। राज्य का हिस्सा बढ़ने जैसे बदलाव भी हुए हैं, इसलिए अपने पंचायत से ताज़ा मज़दूरी दर और काम की उपलब्धता पूछते रहें। पहले से ई-केवाईसी वाले मनरेगा जॉब कार्ड तब तक चलेंगे जब तक नया ग्रामीण रोज़गार गारंटी कार्ड नहीं मिलता।']),
    descriptionEn: L(['From 1 July 2026 the Viksit Bharat — Guarantee for Rozgar and Ajeevika Mission (Gramin), i.e. the VB-G RAM G Act 2025, replaced MGNREGA. Every rural household whose adult members volunteer for unskilled manual work is now guaranteed 125 days of wage employment a year (it was 100 days earlier).', 'Work is provided in the village itself — roads, ponds, irrigation, water conservation and so on. Wages come directly into the bank account. There are changes such as a higher state share, so keep asking your panchayat about current wage rate and work availability. Existing e-KYC-verified MGNREGA job cards stay valid until the new Gramin Rozgar Guarantee Card is issued.']),
    eligibility: L(['ग्रामीण परिवार जिसके वयस्क सदस्य अकुशल शारीरिक काम करने को तैयार हों', 'जॉब कार्ड होना ज़रूरी', 'आय या ज़मीन की कोई सीमा नहीं']),
    eligibilityEn: L(['Rural household whose adult members are willing to do unskilled manual work', 'Job card required', 'No income or land limit']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक (आधार-लिंक)', 'पासपोर्ट साइज़ फोटो', 'परिवार के सदस्यों का विवरण / राशन कार्ड']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook (Aadhaar-linked)', 'Passport size photo', 'Family member details / ration card']),
    howToApply: L(['अपनी ग्राम पंचायत में जॉब कार्ड के लिए सादे कागज़ पर आवेदन दें (या पुराना कार्ड अपडेट/e-KYC कराएं)', 'काम चाहिए तो पंचायत में लिखित आवेदन देकर रसीद लें', 'काम मिलने पर तय स्थान पर हाज़िरी लगवाएं', 'मज़दूरी तय समय में बैंक खाते में आती है; देर होने या काम न मिलने पर शिकायत करें']),
    howToApplyEn: L(['Apply on plain paper at your Gram Panchayat for a job card (or update/e-KYC your old card)', 'Give a written application for work at the panchayat and take a receipt', 'When work is allotted, mark attendance at the given site', 'Wages come to your bank within the time limit; complain if delayed or if work is not given']),
    officialLink: 'https://rural.gov.in',
    faqs: [{ q: 'क्या पुराना मनरेगा जॉब कार्ड बेकार हो गया?', qEn: 'Is my old MGNREGA job card useless now?', a: 'नहीं — ई-केवाईसी वाले पुराने जॉब कार्ड तब तक मान्य रहेंगे जब तक नया कार्ड जारी नहीं होता। पंचायत में e-KYC की स्थिति पूछ लें।', aEn: 'No — e-KYC-verified old job cards stay valid until the new card is issued. Ask your panchayat about your e-KYC status.' }]
  }),

  mk('employment', {
    slug: 'pmegp-self-employment-loan', icon: '🏭',
    title: 'प्रधानमंत्री रोज़गार सृजन कार्यक्रम (PMEGP)', titleEn: 'PM Employment Generation Programme (PMEGP)',
    ministry: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (MSME)', ministryEn: 'Ministry of MSME',
    oneLineSummary: 'अपना उद्योग/सेवा कारोबार शुरू करने पर बैंक लोन के साथ 15% से 35% तक सरकारी सब्सिडी।',
    oneLineSummaryEn: 'Start your own enterprise — bank loan with 15% to 35% government subsidy.',
    benefit: 'परियोजना लागत पर 15–35% सब्सिडी; विनिर्माण में ₹50 लाख और सेवा में ₹20 लाख तक की परियोजना',
    benefitEn: '15–35% subsidy on project cost; projects up to ₹50 lakh (manufacturing) and ₹20 lakh (service)',
    description: L(['PMEGP में नया उद्यम — जैसे अचार-मसाला इकाई, आटा चक्की, सिलाई, डेयरी प्रोसेसिंग, मरम्मत की दुकान — शुरू करने के लिए बैंक से लोन मिलता है और सरकार लागत का एक हिस्सा सब्सिडी के रूप में देती है। ग्रामीण क्षेत्र में सामान्य वर्ग को 25% और विशेष वर्ग (SC/ST/OBC/महिला/पूर्व सैनिक/दिव्यांग) को 35% तक मिलती है; शहरी क्षेत्र में क्रमशः 15% और 25%।', 'आवेदन खादी और ग्रामोद्योग आयोग (KVIC) के पोर्टल पर होता है। ₹10 लाख से ज़्यादा की विनिर्माण परियोजना या ₹5 लाख से ज़्यादा की सेवा परियोजना के लिए कम से कम 8वीं पास होना चाहिए।']),
    descriptionEn: L(['Under PMEGP you get a bank loan to start a new enterprise — pickle-masala unit, flour mill, tailoring, dairy processing, repair shop — and the government gives part of the cost as subsidy. In rural areas the subsidy is 25% for the general category and up to 35% for special categories (SC/ST/OBC/women/ex-servicemen/disabled); in urban areas 15% and 25% respectively.', 'Applications are made on the Khadi and Village Industries Commission (KVIC) portal. For manufacturing projects above ₹10 lakh or service projects above ₹5 lakh you must be at least 8th pass.']),
    eligibility: L(['18 वर्ष से अधिक उम्र का कोई भी व्यक्ति', 'नई परियोजना होनी चाहिए (पहले सरकारी सब्सिडी वाली इकाई नहीं)', 'बड़ी परियोजनाओं के लिए कम से कम 8वीं पास']),
    eligibilityEn: L(['Any person above 18 years of age', 'Must be a new project (not an earlier subsidised unit)', 'At least 8th pass for larger projects']),
    documentsRequired: L(['आधार कार्ड', 'पैन कार्ड', 'परियोजना रिपोर्ट', 'जाति/विशेष वर्ग प्रमाण पत्र (यदि लागू)', 'शैक्षणिक प्रमाण पत्र', 'EDP प्रशिक्षण प्रमाण पत्र (बाद में)']),
    documentsRequiredEn: L(['Aadhaar Card', 'PAN card', 'Project report', 'Caste/special category certificate (if applicable)', 'Educational certificate', 'EDP training certificate (later)']),
    howToApply: L(['kviconline.gov.in/pmegpeportal पर "Apply for New Unit" चुनें', 'आवेदन फॉर्म भरें, परियोजना रिपोर्ट और दस्तावेज़ अपलोड करें', 'ज़िला उद्योग केंद्र / KVIC की समिति इंटरव्यू लेती है', 'बैंक लोन स्वीकृत होने पर सब्सिडी बैंक में जमा होती है; 2-3 साल बाद समायोजित होती है']),
    howToApplyEn: L(['On kviconline.gov.in/pmegpeportal choose "Apply for New Unit"', 'Fill the form and upload project report and documents', 'A committee of the District Industries Centre / KVIC interviews you', 'After the bank loan is sanctioned the subsidy is deposited with the bank and adjusted after 2-3 years']),
    officialLink: 'https://www.kviconline.gov.in/pmegpeportal',
    faqs: [{ q: 'क्या शुरू में अपना पैसा लगाना होता है?', qEn: 'Do I need to invest some of my own money?', a: 'हां, सामान्य वर्ग को परियोजना लागत का 10% और विशेष वर्ग को 5% अपनी पूंजी लगानी होती है। बाकी बैंक लोन और सब्सिडी से।', aEn: 'Yes, 10% of project cost for the general category and 5% for special categories. The rest is bank loan plus subsidy.' }]
  }),

  mk('employment', {
    slug: 'pm-mudra-yojana', icon: '💵',
    title: 'प्रधानमंत्री मुद्रा योजना', titleEn: 'PM Mudra Yojana',
    ministry: 'वित्त मंत्रालय', ministryEn: 'Ministry of Finance',
    oneLineSummary: 'छोटा कारोबार शुरू करने या बढ़ाने के लिए बिना गारंटी का लोन — दुकान, ठेला, डेयरी, सिलाई सबके लिए।',
    oneLineSummaryEn: 'Collateral-free loans to start or grow a small business — shop, cart, dairy, tailoring and more.',
    benefit: 'बिना गिरवी ₹20 लाख तक का लोन — शिशु (₹50,000 तक), किशोर (₹5 लाख तक), तरुण (₹10 लाख तक), तरुण प्लस (₹20 लाख तक)',
    benefitEn: 'Collateral-free loans up to ₹20 lakh — Shishu (up to ₹50,000), Kishor (up to ₹5 lakh), Tarun (up to ₹10 lakh), Tarun Plus (up to ₹20 lakh)',
    description: L(['मुद्रा योजना में सरकार खुद लोन नहीं देती, बल्कि बैंक, क्षेत्रीय ग्रामीण बैंक, सहकारी बैंक और माइक्रोफाइनेंस संस्थाएं छोटे कारोबारियों को बिना गिरवी लोन देती हैं। इसमें दुकान, किराना, सब्ज़ी-फल का ठेला, मुर्गी/बकरी पालन, डेयरी, ऑटो-ई-रिक्शा, सिलाई-ब्यूटी पार्लर जैसे छोटे कारोबार आते हैं।', 'लोन की राशि के हिसाब से तीन-चार श्रेणियां हैं और पहले से मुद्रा लोन समय पर चुका चुके लोगों के लिए "तरुण प्लस" में ₹20 लाख तक का लोन मिलता है। इसके लिए कोई प्रोसेसिंग शुल्क सामान्यतः शिशु लोन पर नहीं लगता।']),
    descriptionEn: L(['Under Mudra the government does not lend directly; banks, regional rural banks, cooperative banks and microfinance institutions give collateral-free loans to small businesses. It covers small ventures like shops, grocery, vegetable/fruit carts, poultry/goat rearing, dairy, auto/e-rickshaw, tailoring and beauty parlours.', 'There are three-four categories by loan size, and "Tarun Plus" offers up to ₹20 lakh to those who have already repaid a Mudra loan on time. Shishu loans usually carry no processing fee.']),
    eligibility: L(['कोई भी भारतीय नागरिक जिसके पास छोटा गैर-कृषि कारोबार (या उसकी योजना) हो', 'कारोबार विनिर्माण, व्यापार या सेवा क्षेत्र का हो', 'पहले के लोन में डिफ़ॉल्टर न हो']),
    eligibilityEn: L(['Any Indian citizen with (or planning) a small non-farm business', 'Business in manufacturing, trading or service sector', 'Not a defaulter on earlier loans']),
    documentsRequired: L(['आधार कार्ड', 'पैन कार्ड', 'पता प्रमाण', 'कारोबार का प्रमाण / योजना', 'पासपोर्ट साइज़ फोटो', 'पिछले 6 महीने की बैंक स्टेटमेंट']),
    documentsRequiredEn: L(['Aadhaar Card', 'PAN card', 'Address proof', 'Business proof / plan', 'Passport size photo', 'Last 6 months bank statement']),
    howToApply: L(['अपने नज़दीकी बैंक, ग्रामीण बैंक या माइक्रोफाइनेंस संस्था में जाकर "मुद्रा लोन फॉर्म" लें', 'या udyamimitra.in पोर्टल पर ऑनलाइन आवेदन करें', 'कारोबार की योजना बताकर दस्तावेज़ जमा करें', 'स्वीकृति के बाद लोन आपके खाते में आता है; समय पर चुकाएं ताकि अगली बार बड़ा लोन मिले']),
    howToApplyEn: L(['Visit a nearby bank, gramin bank or microfinance institution and collect the "Mudra loan form"', 'Or apply online at the udyamimitra.in portal', 'Explain your business plan and submit documents', 'After approval the loan comes to your account; repay on time to qualify for a bigger loan next time']),
    officialLink: 'https://www.mudra.org.in',
    faqs: [{ q: 'क्या खेती के लिए भी मुद्रा लोन मिलता है?', qEn: 'Is Mudra available for farming?', a: 'सीधी फसल खेती के लिए नहीं (उसके लिए KCC है), लेकिन डेयरी, पोल्ट्री, मछली पालन और कृषि-आधारित व्यवसाय के लिए मिल सकता है।', aEn: 'Not for direct crop farming (that is KCC), but it can be available for dairy, poultry, fishery and agro-based businesses.' }]
  }),

  mk('employment', {
    slug: 'pm-vishwakarma-yojana', icon: '🔨',
    title: 'पीएम विश्वकर्मा योजना', titleEn: 'PM Vishwakarma Yojana',
    ministry: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय', ministryEn: 'Ministry of MSME',
    oneLineSummary: 'बढ़ई, लोहार, कुम्हार, दर्जी, नाई जैसे पारंपरिक कारीगरों को ट्रेनिंग, औज़ार और सस्ता लोन।',
    oneLineSummaryEn: 'Training, toolkit and cheap loans for traditional artisans like carpenters, blacksmiths, potters, tailors and barbers.',
    benefit: '₹15,000 का टूलकिट, ट्रेनिंग के दौरान ₹500 प्रतिदिन वज़ीफ़ा, 5% ब्याज पर ₹3 लाख तक का लोन',
    benefitEn: '₹15,000 toolkit, ₹500 per day stipend during training, loan up to ₹3 lakh at 5% interest',
    description: L(['यह योजना 18 पारंपरिक कारीगर वर्गों — जैसे बढ़ई, नाव बनाने वाले, लोहार, ताला-कारीगर, सुनार, कुम्हार, मूर्तिकार/राजमिस्त्री, मोची, राजगीर, टोकरी-चटाई-झाड़ू बनाने वाले, नाई, धोबी, दर्जी, माला बनाने वाले आदि — के लिए है।', 'पंजीकरण के बाद पीएम विश्वकर्मा प्रमाण पत्र और पहचान पत्र मिलता है, 5-7 दिन की बुनियादी ट्रेनिंग (₹500 रोज़) और उन्नत ट्रेनिंग का विकल्प है, ₹15,000 का औज़ार-वाउचर मिलता है और पहले ₹1 लाख, फिर ₹2 लाख का लोन सिर्फ 5% ब्याज पर मिल सकता है।']),
    descriptionEn: L(['This scheme is for 18 traditional artisan trades — such as carpenters, boat makers, blacksmiths, locksmiths, goldsmiths, potters, sculptors/masons, cobblers, basket-mat-broom makers, barbers, washermen, tailors, garland makers and more.', 'After registration you get a PM Vishwakarma certificate and ID card, 5-7 days of basic training (₹500 a day) with an advanced training option, a ₹15,000 toolkit voucher, and a loan first of ₹1 lakh then ₹2 lakh at just 5% interest.']),
    eligibility: L(['18 वर्ष से अधिक उम्र का कारीगर/शिल्पकार, 18 सूचीबद्ध व्यवसायों में से किसी में लगा हो', 'हाथ और औज़ार से काम करने वाला असंगठित क्षेत्र का कारीगर', 'परिवार में एक ही सदस्य को लाभ; सरकारी कर्मचारी नहीं']),
    eligibilityEn: L(['Artisan above 18 years of age engaged in one of the 18 listed trades', 'Unorganised-sector worker working with hands and tools', 'One member per family; not a government employee']),
    documentsRequired: L(['आधार कार्ड', 'मोबाइल नंबर', 'बैंक पासबुक', 'राशन कार्ड / पते का प्रमाण', 'व्यवसाय का प्रमाण / स्व-घोषणा']),
    documentsRequiredEn: L(['Aadhaar Card', 'Mobile number', 'Bank passbook', 'Ration card / address proof', 'Trade proof / self-declaration']),
    howToApply: L(['नज़दीकी CSC पर जाएं या pmvishwakarma.gov.in पर "Artisan Registration" करें', 'आधार, मोबाइल और बैंक विवरण से पंजीकरण और बायोमेट्रिक सत्यापन कराएं', 'ग्राम पंचायत/ULB और ज़िला समिति से सत्यापन के बाद प्रमाण पत्र और ID कार्ड मिलेगा', 'ट्रेनिंग, टूलकिट और लोन के लिए आगे के चरण पोर्टल पर पूरे करें']),
    howToApplyEn: L(['Go to a nearby CSC or do "Artisan Registration" on pmvishwakarma.gov.in', 'Register with Aadhaar, mobile and bank details, and complete biometric verification', 'After verification by Gram Panchayat/ULB and district committee you get the certificate and ID card', 'Complete the further steps for training, toolkit and loan on the portal']),
    officialLink: 'https://pmvishwakarma.gov.in',
    faqs: [{ q: 'क्या महिला कारीगर भी आवेदन कर सकती हैं?', qEn: 'Can women artisans apply?', a: 'हां, दर्जी, माला बनाने, टोकरी बुनने जैसे कई व्यवसायों में बड़ी संख्या में महिलाएं जुड़ी हैं और आवेदन कर सकती हैं।', aEn: 'Yes — many women work in trades like tailoring, garland making and basket weaving and can apply.' }]
  }),

  // ───────────────────────── 🍚 RATION & WELFARE ─────────────────────────
  mk('welfare', {
    slug: 'pm-garib-kalyan-anna-yojana', icon: '🍚',
    title: 'प्रधानमंत्री गरीब कल्याण अन्न योजना (मुफ़्त राशन)', titleEn: 'PM Garib Kalyan Anna Yojana (Free Ration)',
    ministry: 'उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय', ministryEn: 'Ministry of Consumer Affairs, Food & Public Distribution',
    oneLineSummary: 'राशन कार्ड पर हर व्यक्ति को हर महीने 5 किलो अनाज बिल्कुल मुफ़्त।',
    oneLineSummaryEn: '5 kg of grain per person per month absolutely free on a ration card.',
    benefit: 'प्रति व्यक्ति प्रति माह 5 किलो अनाज (गेहूं/चावल) मुफ़्त — अंत्योदय परिवार को 35 किलो प्रति परिवार',
    benefitEn: '5 kg grain (wheat/rice) per person per month free — 35 kg per family for Antyodaya households',
    description: L(['राष्ट्रीय खाद्य सुरक्षा कानून (NFSA) के अंतर्गत आने वाले राशन कार्ड धारकों को PMGKAY में पूरा अनाज मुफ़्त दिया जाता है। प्राथमिकता परिवार (PHH) कार्ड पर हर सदस्य के हिसाब से 5 किलो और अंत्योदय (AAY) कार्ड पर पूरे परिवार को 35 किलो मिलता है। यह मुफ़्त राशन जनवरी 2024 से अगले 5 साल के लिए बढ़ाया गया है।', 'राशन कार्ड की e-KYC (आधार से सत्यापन) कराना ज़रूरी है, वरना नाम कट सकता है। "एक देश एक राशन कार्ड" के तहत आप देश के किसी भी राज्य की राशन दुकान से अपना हिस्सा ले सकते हैं।']),
    descriptionEn: L(['Ration-card holders covered under the National Food Security Act (NFSA) get the entire grain free under PMGKAY. Priority Household (PHH) cards get 5 kg per member and Antyodaya (AAY) cards get 35 kg per family. This free ration has been extended for 5 years from January 2024.', 'Ration-card e-KYC (Aadhaar verification) is necessary or your name may be removed. Under "One Nation One Ration Card" you can draw your share from a ration shop in any state.']),
    eligibility: L(['NFSA के अंतर्गत अंत्योदय (AAY) या प्राथमिकता परिवार (PHH) राशन कार्ड धारक', 'राशन कार्ड में आधार के साथ सभी सदस्यों की e-KYC पूरी हो']),
    eligibilityEn: L(['Holders of Antyodaya (AAY) or Priority Household (PHH) ration cards under NFSA', 'e-KYC of all members with Aadhaar completed on the ration card']),
    documentsRequired: L(['परिवार के सभी सदस्यों का आधार कार्ड', 'निवास / पते का प्रमाण', 'आय प्रमाण / स्व-घोषणा', 'पासपोर्ट साइज़ फोटो', 'बैंक पासबुक']),
    documentsRequiredEn: L(['Aadhaar Card of all family members', 'Residence / address proof', 'Income proof / self-declaration', 'Passport size photo', 'Bank passbook']),
    howToApply: L(['नया राशन कार्ड: अपने राज्य के खाद्य एवं आपूर्ति विभाग की वेबसाइट पर ऑनलाइन आवेदन करें (बिहार: epds.bihar.gov.in) या प्रखंड आपूर्ति कार्यालय / CSC में', 'पुराने कार्ड की e-KYC: राशन दुकान पर या "Mera KYC" ऐप से आधार सत्यापन कराएं', 'अनाज की मात्रा हर माह राशन डीलर की दुकान से ई-पॉस मशीन पर अंगूठा लगाकर लें', 'कम अनाज मिलने या मना करने पर राज्य की राशन हेल्पलाइन या 1967 / 14445 पर शिकायत करें']),
    howToApplyEn: L(['New ration card: apply online on your state food & supplies department website (Bihar: epds.bihar.gov.in) or at the block supply office / CSC', 'e-KYC of an old card: do Aadhaar verification at the ration shop or in the "Mera KYC" app', 'Collect the grain every month at the dealer\'s shop with thumb verification on the ePoS machine', 'If you get less grain or are refused, complain on the state ration helpline or 1967 / 14445']),
    officialLink: 'https://nfsa.gov.in',
    faqs: [{ q: 'राशन कम तौल कर दिया जाए तो क्या करें?', qEn: 'What if I am given less than my quota?', a: 'आपको रसीद लेकर अपना पूरा हक़ मांगने का अधिकार है। कम मिलने पर प्रखंड आपूर्ति पदाधिकारी या राज्य की हेल्पलाइन पर शिकायत करें।', aEn: 'You have the right to demand your full quota with a receipt. If short, complain to the block supply officer or state helpline.' }]
  }),

  mk('welfare', {
    slug: 'pm-jan-dhan-yojana', icon: '🏦',
    title: 'प्रधानमंत्री जन धन योजना', titleEn: 'PM Jan Dhan Yojana',
    ministry: 'वित्त मंत्रालय', ministryEn: 'Ministry of Finance',
    oneLineSummary: 'ज़ीरो बैलेंस बैंक खाता, रुपे डेबिट कार्ड और ₹2 लाख का दुर्घटना बीमा — सबके लिए।',
    oneLineSummaryEn: 'Zero-balance bank account, RuPay debit card and ₹2 lakh accident insurance — for everyone.',
    benefit: 'शून्य बैलेंस खाता, रुपे कार्ड के साथ ₹2 लाख का दुर्घटना बीमा और ₹10,000 तक ओवरड्राफ्ट',
    benefitEn: 'Zero-balance account, RuPay card with ₹2 lakh accident insurance and overdraft up to ₹10,000',
    description: L(['जन धन खाता हर उस व्यक्ति के लिए है जिसका अभी बैंक खाता नहीं है। इसमें न्यूनतम बैलेंस रखने की ज़रूरत नहीं होती, ब्याज मिलता है और रुपे डेबिट कार्ड भी मिलता है। अगस्त 2018 के बाद खुले खातों पर रुपे कार्ड के साथ ₹2 लाख का दुर्घटना बीमा मिलता है।', 'सबसे बड़ा फ़ायदा यह है कि PM-KISAN, पेंशन, छात्रवृत्ति, LPG सब्सिडी जैसे सरकारी लाभ सीधे इसी खाते में आ सकते हैं। खाते की ठीक से KYC करवाकर रखें ताकि सरकारी पैसा रुके नहीं।']),
    descriptionEn: L(['A Jan Dhan account is for everyone who does not yet have a bank account. There is no minimum balance requirement, it earns interest, and comes with a RuPay debit card. Accounts opened after August 2018 get ₹2 lakh accident insurance along with the RuPay card.', 'The biggest benefit is that government payments like PM-KISAN, pensions, scholarships and LPG subsidy can come directly into this account. Keep the account\'s KYC properly done so government money is not held up.']),
    eligibility: L(['10 वर्ष से अधिक उम्र का कोई भी भारतीय नागरिक', 'जिसके पास पहले से बैंक खाता न हो (या बुनियादी बचत खाता चाहिए)']),
    eligibilityEn: L(['Any Indian citizen above 10 years of age', 'Without an existing bank account (or wanting a basic savings account)']),
    documentsRequired: L(['आधार कार्ड', 'या कोई एक मान्य पहचान पत्र (वोटर आईडी, ड्राइविंग लाइसेंस, पैन)', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Or any one valid ID (voter ID, driving licence, PAN)', 'Passport size photo']),
    howToApply: L(['किसी भी बैंक की शाखा या बैंक मित्र (बैंकिंग कॉरस्पोंडेंट) के पास जाएं', 'जन धन खाता खोलने का फॉर्म भरें', 'आधार और फोटो के साथ KYC पूरी करें', 'खाता खुलने पर रुपे कार्ड और पासबुक लें; मोबाइल नंबर खाते से जुड़वाएं']),
    howToApplyEn: L(['Go to any bank branch or Bank Mitra (banking correspondent)', 'Fill the Jan Dhan account opening form', 'Complete KYC with Aadhaar and photo', 'Collect the RuPay card and passbook; link your mobile number to the account']),
    officialLink: 'https://pmjdy.gov.in',
    faqs: [{ q: 'क्या जन धन खाते में पैसा रखना ज़रूरी है?', qEn: 'Must I keep money in a Jan Dhan account?', a: 'नहीं, यह ज़ीरो बैलेंस खाता है। लेकिन बीमा लाभ पाने के लिए कार्ड को हर 90 दिन में एक बार इस्तेमाल करना (लेन-देन करना) अच्छा रहता है।', aEn: 'No, it is a zero-balance account. But to keep the insurance benefit it is good to use the card for a transaction at least once every 90 days.' }]
  }),

  mk('welfare', {
    slug: 'pm-suraksha-jeevan-jyoti-bima', icon: '🛡️',
    title: 'पीएम सुरक्षा बीमा (₹20) और जीवन ज्योति बीमा (₹436)', titleEn: 'PM Suraksha Bima (₹20) & Jeevan Jyoti Bima (₹436)',
    ministry: 'वित्त मंत्रालय', ministryEn: 'Ministry of Finance',
    oneLineSummary: 'सिर्फ ₹20 में ₹2 लाख का दुर्घटना बीमा और ₹436 में ₹2 लाख का जीवन बीमा।',
    oneLineSummaryEn: '₹2 lakh accident insurance for just ₹20 and ₹2 lakh life insurance for ₹436.',
    benefit: 'PMSBY: ₹20/वर्ष में ₹2 लाख; PMJJBY: ₹436/वर्ष में ₹2 लाख — बैंक खाते से अपने आप कटता है',
    benefitEn: 'PMSBY: ₹2 lakh for ₹20/year; PMJJBY: ₹2 lakh for ₹436/year — auto-debited from your bank account',
    description: L(['किसान, मज़दूर और छोटे कारोबारी परिवार की कमाई का सहारा अक्सर एक ही व्यक्ति होता है। उसकी मृत्यु या अपंगता परिवार को कर्ज़ में डाल सकती है। पीएम सुरक्षा बीमा योजना (PMSBY) में दुर्घटना से मृत्यु या पूर्ण अपंगता पर ₹2 लाख और आंशिक अपंगता पर ₹1 लाख मिलते हैं, प्रीमियम सिर्फ ₹20 सालाना।', 'पीएम जीवन ज्योति बीमा योजना (PMJJBY) में किसी भी कारण से मृत्यु होने पर ₹2 लाख मिलते हैं, प्रीमियम ₹436 सालाना। दोनों का प्रीमियम बचत खाते से हर साल अपने आप कट जाता है, इसलिए खाते में 31 मई से पहले पर्याप्त पैसा रखें।']),
    descriptionEn: L(['In farmer, labour and small-trader families one person is often the main earner. His death or disability can push the family into debt. Under PM Suraksha Bima Yojana (PMSBY) you get ₹2 lakh for death or total disability by accident and ₹1 lakh for partial disability, at a premium of just ₹20 a year.', 'PM Jeevan Jyoti Bima Yojana (PMJJBY) pays ₹2 lakh on death from any cause, at ₹436 a year. Both premiums are auto-debited from the savings account each year, so keep enough balance before 31 May.']),
    eligibility: L(['PMSBY: 18 से 70 वर्ष, बचत खाता धारक', 'PMJJBY: 18 से 50 वर्ष, बचत खाता धारक (नामांकन के बाद 55 वर्ष तक जारी)', 'खाता आधार से जुड़ा हो']),
    eligibilityEn: L(['PMSBY: age 18 to 70, savings account holder', 'PMJJBY: age 18 to 50, savings account holder (continues till 55 after enrolment)', 'Account linked with Aadhaar']),
    documentsRequired: L(['आधार कार्ड', 'बचत बैंक खाते की पासबुक', 'नामित व्यक्ति (नॉमिनी) का विवरण']),
    documentsRequiredEn: L(['Aadhaar Card', 'Savings bank passbook', 'Nominee details']),
    howToApply: L(['अपने बैंक की शाखा में जाएं या नेट/मोबाइल बैंकिंग से आवेदन करें', 'PMSBY/PMJJBY का फॉर्म भरें और ऑटो-डेबिट की सहमति दें', 'नॉमिनी का नाम ज़रूर लिखवाएं', 'हर साल 31 मई तक खाते में प्रीमियम जितना पैसा रखें']),
    howToApplyEn: L(['Visit your bank branch or apply through net/mobile banking', 'Fill the PMSBY/PMJJBY form and give auto-debit consent', 'Be sure to record a nominee', 'Keep enough balance for the premium in the account by 31 May every year']),
    lastDate: 'नामांकन पूरे साल; प्रीमियम हर साल 31 मई तक कटता है', lastDateEn: 'Enrol anytime; premium debits by 31 May every year',
    officialLink: 'https://jansuraksha.gov.in',
    faqs: [{ q: 'दावा कैसे करें?', qEn: 'How to claim?', a: 'नॉमिनी बैंक शाखा में दावा फॉर्म, मृत्यु प्रमाण पत्र और ज़रूरी कागज़ जमा करता है (दुर्घटना में FIR/पोस्टमार्टम रिपोर्ट भी)। दावा बैंक के ज़रिए बीमा कंपनी तक पहुंचता है।', aEn: 'The nominee submits the claim form, death certificate and required papers (FIR/post-mortem in an accident) at the bank branch. The bank forwards it to the insurer.' }]
  })

  );
})();
