// ======================================================================
//  STATIC SCHEMES — 🌾 किसान (Farmer)
//  Built-in data: works even when the Render server is asleep/offline.
//  Same field names as server/data/schemes.json, so article.html and
//  the cards render them exactly like admin-added schemes.
//  Facts verified Oct 2026 — always re-check the official site before
//  applying, benefits/limits can change with each Budget.
// ======================================================================
(function () {
  const L = a => a.join('\n');
  const U = '2026-10-13T00:00:00.000Z';
  const ONGOING = 'चालू — कभी भी आवेदन करें';
  const ONGOING_EN = 'Ongoing — apply anytime';
  const base = { tag: 'farmer', isNew: false, published: true, lastDate: ONGOING, lastDateEn: ONGOING_EN, createdAt: U, updatedAt: U, _static: true };
  (window.GS_STATIC_SCHEMES = window.GS_STATIC_SCHEMES || []).push(

  Object.assign({}, base, {
    slug: 'pm-kisan-samman-nidhi', icon: '💰',
    title: 'पीएम-किसान सम्मान निधि', titleEn: 'PM-KISAN Samman Nidhi',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'हर किसान परिवार को सीधे बैंक खाते में सालाना ₹6,000 की आर्थिक मदद।',
    oneLineSummaryEn: 'Direct ₹6,000 per year into the bank account of every eligible farmer family.',
    benefit: '₹6,000 सालाना — ₹2,000 की 3 किस्तों में सीधे बैंक खाते में (DBT)',
    benefitEn: '₹6,000 per year — in 3 instalments of ₹2,000, straight to your bank account (DBT)',
    description: L([
      'पीएम-किसान सम्मान निधि केंद्र सरकार की सबसे बड़ी किसान योजनाओं में से एक है, जो 24 फ़रवरी 2019 को शुरू हुई। इसमें खेती योग्य ज़मीन वाले किसान परिवार को हर साल ₹6,000 मिलते हैं — यह पैसा ₹2,000 की तीन किस्तों में सीधे आधार से जुड़े बैंक खाते में आता है, बीच में कोई दलाल नहीं।',
      'पैसा खाद, बीज, दवा या घर के छोटे खर्चों में काम आता है। अब किस्त पाने के लिए e-KYC, बैंक खाते में आधार सीडिंग और ज़मीन के रिकॉर्ड का सत्यापन ज़रूरी है — इनमें से कुछ भी अधूरा रहा तो किस्त रुक जाती है।'
    ]),
    descriptionEn: L([
      'PM-KISAN is one of the Centre\'s biggest farmer schemes, started on 24 February 2019. An eligible farmer family with cultivable land gets ₹6,000 every year, paid in three instalments of ₹2,000 directly into an Aadhaar-linked bank account — no middleman.',
      'The money helps with fertiliser, seed, medicine or small household costs. To receive an instalment you must now complete e-KYC, bank-Aadhaar seeding and land-record verification — if any one is pending, the instalment gets stuck.'
    ]),
    eligibility: L(['खेती योग्य ज़मीन वाला किसान परिवार (पति, पत्नी और नाबालिग बच्चे = 1 परिवार)', 'e-KYC पूरा हो, बैंक खाता आधार से जुड़ा हो', 'आयकर देने वाले, सरकारी/पूर्व उच्च पद वाले, ₹10,000+ मासिक पेंशन वाले और संस्थागत भूमिधारक पात्र नहीं']),
    eligibilityEn: L(['Farmer family owning cultivable land (husband, wife & minor children = 1 family)', 'e-KYC done and bank account linked with Aadhaar', 'Income-tax payers, high-ranking officials, pensioners with ₹10,000+/month and institutional landholders are not eligible']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक (आधार से जुड़ा खाता)', 'ज़मीन के कागज़ (खतौनी / खसरा / जमाबंदी)', 'आधार से जुड़ा मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook (Aadhaar-linked account)', 'Land records (Khatauni / Khasra / Jamabandi)', 'Mobile number linked with Aadhaar']),
    howToApply: L(['pmkisan.gov.in खोलें → "Farmers Corner" → "New Farmer Registration"', 'आधार नंबर, मोबाइल, राज्य डालकर OTP से आगे बढ़ें और ज़मीन व बैंक की जानकारी भरें', 'e-KYC करें — पोर्टल पर OTP से, या नज़दीकी CSC पर बायोमेट्रिक से, या PM-KISAN ऐप में फेस ऑथेंटिकेशन से', 'राज्य सरकार के सत्यापन के बाद किस्तें आनी शुरू हो जाती हैं; "Beneficiary Status" में स्थिति देखते रहें', 'दिक्कत हो तो हेल्पलाइन 155261 पर संपर्क करें या अपने कृषि कार्यालय / CSC जाएं']),
    howToApplyEn: L(['Open pmkisan.gov.in → "Farmers Corner" → "New Farmer Registration"', 'Enter Aadhaar, mobile and state, verify OTP, then fill land and bank details', 'Do e-KYC — by OTP on the portal, biometric at a nearby CSC, or face authentication in the PM-KISAN app', 'After state verification, instalments start; keep checking "Beneficiary Status"', 'For problems call helpline 155261 or visit your agriculture office / CSC']),
    officialLink: 'https://pmkisan.gov.in',
    faqs: [
      { q: 'किस्त नहीं आ रही, क्या करें?', qEn: 'My instalment has not come — what to do?', a: 'सबसे पहले pmkisan.gov.in पर "Beneficiary Status" देखें। अक्सर वजह e-KYC बाकी होना, बैंक खाते में आधार सीडिंग (NPCI) न होना या ज़मीन का सत्यापन अधूरा होना होती है। इसे ठीक कराकर हेल्पलाइन 155261 या अपने ब्लॉक कृषि कार्यालय में शिकायत दर्ज कराएं।', aEn: 'First check "Beneficiary Status" on pmkisan.gov.in. The usual causes are pending e-KYC, no Aadhaar seeding (NPCI) on the bank account, or incomplete land verification. Fix that and complain on helpline 155261 or at your block agriculture office.' },
      { q: 'क्या एक परिवार में दो लोगों को पैसा मिल सकता है?', qEn: 'Can two members of one family both get the money?', a: 'नहीं, पति, पत्नी और नाबालिग बच्चों को मिलाकर एक परिवार में सिर्फ़ एक लाभार्थी को ही लाभ मिलता है।', aEn: 'No. Husband, wife and minor children count as one family and only one beneficiary per family is paid.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'kisan-credit-card-kcc', icon: '💳',
    title: 'किसान क्रेडिट कार्ड (KCC)', titleEn: 'Kisan Credit Card (KCC)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय / वित्त मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare / Ministry of Finance',
    oneLineSummary: 'खेती के लिए बहुत कम ब्याज पर आसान लोन कार्ड — बीज, खाद, दवा और मज़दूरी के लिए, सूदखोर से बचाव।',
    oneLineSummaryEn: 'A low-interest loan card for farming — seed, fertiliser, pesticide and labour; keeps you away from moneylenders.',
    benefit: '₹3 लाख तक के फसल लोन पर समय से चुकाने पर सिर्फ 4% ब्याज; सीमा ₹5 लाख तक',
    benefitEn: 'Crop loans up to ₹3 lakh at just 4% effective interest if repaid on time; limit up to ₹5 lakh',
    description: L([
      'किसान क्रेडिट कार्ड (KCC) एक रुपे कार्ड जैसा कार्ड है जिससे किसान खेती के खर्च — बीज, खाद, कीटनाशक, मज़दूरी — के लिए बैंक से आसानी से उधार ले सकता है। बैंक आपकी ज़मीन और फसल के हिसाब से एक सीमा तय करता है; आप ज़रूरत पर पैसा निकालते हैं और फसल बिकने पर लौटा देते हैं।',
      'सरकार की ब्याज सहायता योजना (MISS) के तहत ₹3 लाख तक के फसल लोन पर ब्याज 7% है, और समय पर चुकाने पर 3% की अतिरिक्त छूट मिलने से असली ब्याज सिर्फ 4% रह जाता है। बजट 2025-26 में KCC की सीमा ₹3 लाख से बढ़ाकर ₹5 लाख की गई। पशुपालन और मछली पालन करने वाले भी KCC बनवा सकते हैं।'
    ]),
    descriptionEn: L([
      'The Kisan Credit Card (KCC) is a RuPay-style card that lets a farmer borrow easily from a bank for farming costs — seed, fertiliser, pesticide, labour. The bank sets a limit based on your land and crop; you withdraw when needed and repay after the harvest is sold.',
      'Under the government\'s Modified Interest Subvention Scheme (MISS), crop loans up to ₹3 lakh carry 7% interest, and a further 3% prompt-repayment incentive brings the effective rate down to just 4%. Budget 2025-26 raised the KCC limit from ₹3 lakh to ₹5 lakh. Animal-husbandry and fishery farmers can get a KCC too.'
    ]),
    eligibility: L(['खुद की या पट्टे/बटाई पर खेती करने वाला किसान, किराएदार किसान, साझा खेती करने वाले', 'पशुपालक और मछली पालक किसान भी', 'स्वयं सहायता समूह / संयुक्त देयता समूह (JLG) भी आवेदन कर सकते हैं']),
    eligibilityEn: L(['Owner farmers, tenant farmers, oral lessees and sharecroppers', 'Animal-husbandry and fishery farmers too', 'Self-help groups / Joint Liability Groups (JLG) can also apply']),
    documentsRequired: L(['आधार कार्ड', 'पैन कार्ड (या फॉर्म 60)', 'ज़मीन के कागज़ (खतौनी / खसरा) या पट्टे का कागज़', 'पासपोर्ट साइज़ फोटो', 'बैंक पासबुक']),
    documentsRequiredEn: L(['Aadhaar Card', 'PAN card (or Form 60)', 'Land records (Khatauni / Khasra) or lease paper', 'Passport size photo', 'Bank passbook']),
    howToApply: L(['अपने बैंक की नज़दीकी शाखा (SBI, PNB, ग्रामीण बैंक, सहकारी बैंक आदि) में जाएं', 'KCC आवेदन फॉर्म लें — या pmkisan.gov.in से फॉर्म डाउनलोड करें; PM-KISAN लाभार्थियों के लिए प्रक्रिया आसान है', 'फॉर्म के साथ आधार, ज़मीन के कागज़ और फोटो लगाएं', '₹2 लाख तक के लोन पर कोई गारंटी / गिरवी नहीं लगती', 'जांच के बाद आमतौर पर 2-3 हफ्तों में कार्ड मिल जाता है']),
    howToApplyEn: L(['Visit your nearest bank branch (SBI, PNB, Gramin bank, cooperative bank etc.)', 'Collect the KCC form — or download it from pmkisan.gov.in; the process is simpler for PM-KISAN beneficiaries', 'Attach Aadhaar, land records and photo', 'No collateral is needed for loans up to ₹2 lakh', 'The card usually arrives in 2-3 weeks after verification']),
    officialLink: 'https://pmkisan.gov.in',
    faqs: [
      { q: 'क्या बिना अपनी ज़मीन के भी KCC मिल सकता है?', qEn: 'Can I get KCC without my own land?', a: 'हां, पट्टे/बटाई पर खेती करने वाले, पशुपालक और मछली पालक भी आवेदन कर सकते हैं।', aEn: 'Yes — lessee/sharecropper farmers, animal-husbandry and fishery farmers can apply too.' },
      { q: '4% ब्याज कब मिलता है?', qEn: 'When do I get the 4% interest rate?', a: 'लोन 7% पर मिलता है; तय तारीख तक समय पर चुकाने पर 3% की अतिरिक्त छूट (PRI) मिलती है। देर करने पर यह छूट नहीं मिलती, इसलिए तारीख याद रखें।', aEn: 'The loan is at 7%; if you repay by the due date you get an extra 3% incentive (PRI). Repay late and you lose it — so remember the date.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'pm-fasal-bima-yojana', icon: '🛡️',
    title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)', titleEn: 'PM Fasal Bima Yojana (PMFBY)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'बाढ़, सूखा, ओले या कीट से फसल बर्बाद हो जाए तो नुकसान की भरपाई — बहुत कम प्रीमियम पर।',
    oneLineSummaryEn: 'Compensation when flood, drought, hail or pests destroy your crop — at a very small premium.',
    benefit: 'खरीफ़ में सिर्फ 2%, रबी में 1.5% प्रीमियम — बाकी प्रीमियम सरकार भरती है',
    benefitEn: 'Pay only 2% (Kharif) or 1.5% (Rabi) premium — the government pays the rest',
    description: L([
      'प्रधानमंत्री फसल बीमा योजना प्राकृतिक आपदा — बाढ़, सूखा, ओलावृष्टि, चक्रवात, कीट व रोग — से फसल खराब होने पर किसान को बीमा राशि देती है। किसान बीमित राशि का सिर्फ 2% (खरीफ़), 1.5% (रबी) और 5% (वाणिज्यिक/बागवानी फसलें) प्रीमियम देता है, बाकी केंद्र और राज्य सरकार भरती हैं।',
      'खड़ी फसल के अलावा कटाई के बाद खेत में सूखने के लिए पड़ी फसल (14 दिन तक) के नुकसान का भी बीमा है। स्थानीय आपदा (ओला, जलभराव, बादल फटना, बिजली से आग) में नुकसान हो तो 72 घंटे के भीतर बताना ज़रूरी है — यही सबसे अहम नियम है। 2020 से यह योजना सभी किसानों के लिए स्वैच्छिक है।'
    ]),
    descriptionEn: L([
      'PMFBY pays the farmer an insured amount when a crop is damaged by natural calamity — flood, drought, hailstorm, cyclone, pests and disease. The farmer pays only 2% (Kharif), 1.5% (Rabi) or 5% (commercial/horticulture crops) of the sum insured; the Centre and the state pay the rest.',
      'Besides the standing crop, post-harvest loss to cut crop drying in the field (up to 14 days) is covered too. For localised calamities (hail, waterlogging, cloudburst, lightning fire) you must report the loss within 72 hours — this is the single most important rule. Since 2020 the scheme is voluntary for all farmers.'
    ]),
    eligibility: L(['सभी किसान — मालिक, बटाईदार और पट्टे वाले किसान भी', 'अधिसूचित फसल उगाने वाले (आपके ज़िले में कौन-सी फसल कवर है, यह बैंक/कृषि कार्यालय बताएगा)', 'फसल बुवाई के सीज़न की अंतिम तिथि से पहले नामांकन ज़रूरी']),
    eligibilityEn: L(['All farmers — owners, sharecroppers and tenant farmers', 'Growing a notified crop (the bank / agriculture office will tell which crops are covered in your district)', 'Enrol before the season\'s last date']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'ज़मीन के कागज़ या पट्टे/बटाई का घोषणा-पत्र', 'बुवाई का प्रमाण / स्व-घोषणा', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Land records or lease/sharecropping declaration', 'Sowing certificate / self-declaration', 'Passport size photo']),
    howToApply: L(['नज़दीकी बैंक, CSC या pmfby.gov.in पर जाएं — बिना KCC वाले किसान भी नामांकन कर सकते हैं', 'pmfby.gov.in पर "Farmer Corner" → "Guest Farmer" या लॉगिन करके फसल, ज़मीन और बैंक विवरण भरें', 'प्रीमियम ऑनलाइन या बैंक में जमा करें और रसीद/पॉलिसी संभालकर रखें', 'फसल को नुकसान होने पर 72 घंटे में "Crop Insurance" ऐप, हेल्पलाइन 14447, बैंक या कृषि कार्यालय को सूचना दें (खेत की फोटो के साथ)', 'दावे की स्थिति pmfby.gov.in पर देखते रहें']),
    howToApplyEn: L(['Go to a nearby bank, CSC or pmfby.gov.in — farmers without a KCC can enrol too', 'On pmfby.gov.in use "Farmer Corner" → "Guest Farmer" or log in, and fill crop, land and bank details', 'Pay the premium online or at the bank and keep the receipt/policy', 'If your crop is damaged, report within 72 hours via the "Crop Insurance" app, helpline 14447, bank or agriculture office (with a photo of the field)', 'Track the claim on pmfby.gov.in']),
    lastDate: 'सीज़न के हिसाब से — खरीफ़: आमतौर पर जुलाई अंत; रबी: आमतौर पर दिसंबर अंत (राज्य के अनुसार बदलता है)',
    lastDateEn: 'Season-wise — Kharif: usually end July; Rabi: usually end December (varies by state)',
    officialLink: 'https://pmfby.gov.in',
    faqs: [
      { q: 'फसल खराब हो जाए तो कितने समय में बताना होगा?', qEn: 'How soon must I report crop damage?', a: 'ओला, जलभराव, बादल फटना जैसी स्थानीय आपदा और कटाई-बाद के नुकसान में 72 घंटे के भीतर बताना ज़रूरी है। हेल्पलाइन 14447, "Crop Insurance" ऐप, बैंक या कृषि कार्यालय में सूचना दें। पहले सूचना दें, कागज़ बाद में जुटाएं।', aEn: 'For localised calamities such as hail, waterlogging or cloudburst and for post-harvest loss, within 72 hours. Use helpline 14447, the "Crop Insurance" app, your bank or agriculture office. Report first, gather papers later.' },
      { q: 'क्या बैंक लोन लेने पर बीमा ज़बरदस्ती कटता है?', qEn: 'Is insurance compulsory if I take a bank loan?', a: 'नहीं। खरीफ़ 2020 से यह सभी किसानों के लिए स्वैच्छिक है। अगर आप नहीं चाहते तो बैंक को लिखित में बता सकते हैं।', aEn: 'No. Since Kharif 2020 it is voluntary for everyone. If you do not want it, tell the bank in writing.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'pm-kisan-maandhan-pension', icon: '👴',
    title: 'पीएम किसान मानधन पेंशन योजना', titleEn: 'PM Kisan Maandhan Pension Yojana',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'छोटे किसानों के लिए बुढ़ापे की पेंशन — 60 साल के बाद हर महीने ₹3,000।',
    oneLineSummaryEn: 'Old-age pension for small farmers — ₹3,000 every month after age 60.',
    benefit: '60 वर्ष के बाद ₹3,000 मासिक पेंशन; पति-पत्नी दोनों जुड़ें तो दोनों को',
    benefitEn: '₹3,000 monthly pension after age 60; both husband and wife can enrol separately',
    description: L([
      'यह योजना 2 हेक्टेयर तक की ज़मीन वाले छोटे और सीमांत किसानों के बुढ़ापे को सुरक्षित करने के लिए है। किसान अपनी उम्र के हिसाब से हर महीने ₹55 से ₹200 जमा करता है और उतनी ही रकम सरकार अपनी तरफ़ से मिलाती है। 60 साल के बाद किसान को ₹3,000 मासिक पेंशन मिलती है।',
      'अगर किसान की मृत्यु हो जाए तो जीवनसाथी को 50% यानी ₹1,500 पारिवारिक पेंशन मिलती है। PM-KISAN के लाभार्थी चाहें तो अंशदान सीधे अपनी किस्त से कटवा सकते हैं — अलग से जेब से पैसा नहीं देना पड़ता।'
    ]),
    descriptionEn: L([
      'This scheme secures the old age of small and marginal farmers owning up to 2 hectares. The farmer pays ₹55 to ₹200 a month depending on entry age and the government adds an equal amount. After age 60 the farmer gets ₹3,000 a month as pension.',
      'If the farmer dies, the spouse receives 50% — ₹1,500 — as family pension. PM-KISAN beneficiaries can have the contribution deducted directly from their instalment, so nothing extra comes out of pocket.'
    ]),
    eligibility: L(['उम्र 18 से 40 वर्ष', 'अधिकतम 2 हेक्टेयर तक खेती योग्य ज़मीन', 'NPS, ESIC या EPFO के सदस्य और आयकर दाता पात्र नहीं']),
    eligibilityEn: L(['Age 18 to 40 years', 'Cultivable land up to 2 hectares', 'Members of NPS, ESIC or EPFO and income-tax payers are not eligible']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक / IFSC कोड', 'ज़मीन के कागज़ (खतौनी)', 'मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook / IFSC code', 'Land records (Khatauni)', 'Mobile number']),
    howToApply: L(['अपने नज़दीकी CSC (कॉमन सर्विस सेंटर) पर जाएं', 'आधार, बैंक पासबुक और ज़मीन के कागज़ दिखाकर ऑनलाइन नामांकन कराएं', 'उम्र के अनुसार तय मासिक अंशदान की पहली किस्त नकद या PM-KISAN की किस्त से कटवाएं', 'आपको एक किसान पेंशन खाता संख्या (PAN) और पेंशन कार्ड मिलेगा — संभालकर रखें']),
    howToApplyEn: L(['Visit your nearest CSC (Common Service Centre)', 'Enrol online by showing Aadhaar, bank passbook and land records', 'Pay the first monthly contribution (by age) in cash, or opt to deduct it from your PM-KISAN instalment', 'You will get a Kisan Pension Account Number and pension card — keep it safe']),
    officialLink: 'https://maandhan.in',
    faqs: [
      { q: 'अंशदान कितना देना होगा?', qEn: 'How much do I have to contribute?', a: '18 साल की उम्र में जुड़ने पर लगभग ₹55 प्रति माह और 40 साल में जुड़ने पर ₹200 प्रति माह। उतनी ही राशि सरकार जमा करती है।', aEn: 'About ₹55 a month if you join at 18 and ₹200 a month if you join at 40. The government deposits an equal amount.' },
      { q: 'बीच में छोड़ना चाहें तो?', qEn: 'What if I want to leave midway?', a: 'योजना छोड़ने पर आपका जमा किया हुआ अंशदान ब्याज सहित वापस मिलता है, लेकिन 60 साल से पहले छोड़ने पर पेंशन नहीं मिलेगी। विस्तृत नियम CSC पर पूछें।', aEn: 'If you exit, your own contribution is returned with interest, but there is no pension. Ask the CSC for the detailed rules.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'soil-health-card', icon: '🌱',
    title: 'मृदा स्वास्थ्य कार्ड (Soil Health Card)', titleEn: 'Soil Health Card',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'अपने खेत की मिट्टी की मुफ़्त जांच — कौन-सी और कितनी खाद डालें, यह पता चलता है।',
    oneLineSummaryEn: 'Free soil testing for your field — tells exactly which fertiliser to use and how much.',
    benefit: 'मिट्टी की मुफ़्त जांच और खाद की सटीक सलाह — खर्च घटे, पैदावार बढ़े',
    benefitEn: 'Free soil test with exact fertiliser advice — lower cost, higher yield',
    description: L([
      'मृदा स्वास्थ्य कार्ड में आपके खेत की मिट्टी का पूरा हाल दर्ज होता है — नाइट्रोजन, फॉस्फोरस, पोटाश, सल्फर, जिंक, आयरन, कॉपर, मैंगनीज़, बोरॉन, pH, EC और जैविक कार्बन जैसे 12 पैरामीटर। उसके आधार पर बताया जाता है कि आपकी फसल के लिए कौन-सी खाद कितनी डालनी है।',
      'बिना जांचे अंदाज़े से यूरिया-डीएपी डालने से पैसा भी बर्बाद होता है और मिट्टी भी खराब होती है। यह जांच हर किसान के लिए बिल्कुल मुफ़्त है और हर 2 साल में दोबारा की जाती है।'
    ]),
    descriptionEn: L([
      'The Soil Health Card records the full condition of your field\'s soil — 12 parameters including nitrogen, phosphorus, potash, sulphur, zinc, iron, copper, manganese, boron, pH, EC and organic carbon. Based on it, you are told which fertiliser to use, and how much, for your crop.',
      'Guessing urea-DAP doses wastes money and damages the soil. The test is completely free for every farmer and repeated every 2 years.'
    ]),
    eligibility: L(['देश का हर किसान', 'कोई ज़मीन-सीमा या आय-सीमा नहीं']),
    eligibilityEn: L(['Every farmer in the country', 'No land or income limit']),
    documentsRequired: L(['आधार कार्ड', 'खेत का खसरा / खाता नंबर', 'मोबाइल नंबर']),
    documentsRequiredEn: L(['Aadhaar Card', 'Plot Khasra / Khata number', 'Mobile number']),
    howToApply: L(['अपने ब्लॉक के कृषि कार्यालय / कृषि विज्ञान केंद्र (KVK) में संपर्क करें', 'अधिकारी फसल कटाई के बाद या बुवाई से पहले खेत से मिट्टी का नमूना लेंगे — आप खुद भी ला सकते हैं', 'नमूना मिट्टी जांच प्रयोगशाला भेजा जाता है, कार्ड तैयार होने पर मिलता है', 'कार्ड की जानकारी soilhealth.dac.gov.in पर रजिस्टर करके ऑनलाइन भी देख सकते हैं']),
    howToApplyEn: L(['Contact your block agriculture office or Krishi Vigyan Kendra (KVK)', 'An officer takes a soil sample after harvest or before sowing — you may also bring it yourself', 'The sample goes to a soil testing lab and you get the card when ready', 'You can also view it online at soilhealth.dac.gov.in after registering']),
    officialLink: 'https://soilhealth.dac.gov.in',
    faqs: [
      { q: 'क्या इसके लिए कोई फीस है?', qEn: 'Is there any fee?', a: 'नहीं, सरकारी मृदा जांच और कार्ड बिल्कुल मुफ़्त हैं। किसी को पैसे न दें।', aEn: 'No, the government soil test and card are completely free. Never pay anyone.' },
      { q: 'नमूना कब लेना चाहिए?', qEn: 'When should the sample be taken?', a: 'फसल कटने के बाद या अगली बुवाई से पहले, जब खेत खाली हो। खेत के 5-6 अलग-अलग जगहों से मिट्टी लेकर मिलाई जाती है।', aEn: 'After harvest or before the next sowing, when the field is empty. Soil from 5-6 spots in the field is mixed.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'agri-machinery-subsidy-smam', icon: '🚜',
    title: 'कृषि यंत्रीकरण सब्सिडी (SMAM)', titleEn: 'Farm Machinery Subsidy (SMAM)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'ट्रैक्टर, रोटावेटर, थ्रेशर, सीड ड्रिल जैसे कृषि यंत्रों पर 40% से 50% तक अनुदान।',
    oneLineSummaryEn: '40% to 50% subsidy on tractors, rotavators, threshers, seed drills and other farm machines.',
    benefit: 'कृषि यंत्र की कीमत पर 40–50% तक सब्सिडी (वर्ग के अनुसार)',
    benefitEn: '40–50% subsidy on the cost of farm machinery (varies by category)',
    description: L([
      'कृषि यंत्रीकरण उप-मिशन (SMAM) का मकसद छोटे और सीमांत किसानों तक आधुनिक मशीनें पहुंचाना है, ताकि मेहनत घटे, समय बचे और लागत कम हो। इसमें ट्रैक्टर, पावर टिलर, रोटावेटर, सीड ड्रिल, थ्रेशर, हैप्पी सीडर, स्प्रेयर जैसे यंत्र शामिल हैं।',
      'अनुदान आमतौर पर SC/ST, लघु-सीमांत, महिला किसानों को 50% और बाकी किसानों को 40% तक मिलता है। इसके अलावा कस्टम हायरिंग सेंटर (यंत्र बैंक) खोलने पर भी सहायता है। हर राज्य अपनी सूची और राशि तय करता है, इसलिए अपने राज्य के कृषि विभाग के पोर्टल पर देखें।'
    ]),
    descriptionEn: L([
      'The Sub-Mission on Agricultural Mechanization (SMAM) brings modern machines to small and marginal farmers to cut drudgery, save time and lower cost. It covers tractors, power tillers, rotavators, seed drills, threshers, happy seeders, sprayers and more.',
      'Subsidy is typically up to 50% for SC/ST, small-marginal and women farmers and up to 40% for others. Help is also available for setting up a Custom Hiring Centre (machinery bank). Each state sets its own list and amounts, so check your state agriculture department portal.'
    ]),
    eligibility: L(['किसान, किसान समूह, FPO, सहकारी समिति', 'SC/ST, लघु-सीमांत और महिला किसानों को अधिक अनुदान', 'आमतौर पर पिछले कुछ सालों में उसी यंत्र पर सब्सिडी न ली हो']),
    eligibilityEn: L(['Farmers, farmer groups, FPOs, cooperative societies', 'Higher subsidy for SC/ST, small-marginal and women farmers', 'Usually you should not have taken subsidy on the same machine in recent years']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'ज़मीन के कागज़ (खतौनी)', 'जाति प्रमाण पत्र (SC/ST के लिए)', 'पासपोर्ट साइज़ फोटो', 'यंत्र का कोटेशन']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Land records (Khatauni)', 'Caste certificate (for SC/ST)', 'Passport size photo', 'Quotation of the machine']),
    howToApply: L(['अपने राज्य के कृषि विभाग के DBT/यंत्रीकरण पोर्टल पर रजिस्ट्रेशन करें (केंद्रीय पोर्टल: agrimachinery.nic.in)', 'यंत्र चुनकर ऑनलाइन आवेदन करें — आवेदन की अवधि राज्य घोषित करता है', 'चयन होने पर अधिकृत डीलर से यंत्र खरीदें और बिल अपलोड करें', 'भौतिक सत्यापन के बाद सब्सिडी सीधे बैंक खाते में आती है']),
    howToApplyEn: L(['Register on your state agriculture department DBT/mechanisation portal (central portal: agrimachinery.nic.in)', 'Choose the machine and apply online — the state announces the application window', 'If selected, buy from an authorised dealer and upload the bill', 'After physical verification the subsidy comes directly to your bank account']),
    lastDate: 'राज्य द्वारा समय-समय पर घोषित — अपने कृषि विभाग से पूछें',
    lastDateEn: 'Announced by the state from time to time — ask your agriculture department',
    officialLink: 'https://agrimachinery.nic.in',
    faqs: [
      { q: 'पहले मशीन खरीदूं या पहले आवेदन?', qEn: 'Buy the machine first or apply first?', a: 'पहले ऑनलाइन आवेदन और स्वीकृति मिलनी चाहिए, उसके बाद ही मशीन खरीदें। स्वीकृति से पहले खरीदने पर सब्सिडी नहीं मिलती।', aEn: 'Apply online and get approval first, then buy. Buying before approval usually means no subsidy.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'pmksy-micro-irrigation', icon: '💧',
    title: 'सूक्ष्म सिंचाई योजना — पर ड्रॉप मोर क्रॉप', titleEn: 'Micro Irrigation — Per Drop More Crop (PMKSY)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'ड्रिप और स्प्रिंकलर सिंचाई सेट पर भारी सब्सिडी — कम पानी, ज़्यादा पैदावार।',
    oneLineSummaryEn: 'Heavy subsidy on drip and sprinkler irrigation sets — less water, more yield.',
    benefit: 'ड्रिप/स्प्रिंकलर पर छोटे-सीमांत किसानों को 55% और अन्य किसानों को 45% तक सब्सिडी',
    benefitEn: 'Up to 55% subsidy for small-marginal farmers and 45% for others on drip/sprinkler sets',
    description: L([
      'प्रधानमंत्री कृषि सिंचाई योजना का "पर ड्रॉप मोर क्रॉप" हिस्सा ड्रिप और स्प्रिंकलर जैसी सूक्ष्म सिंचाई प्रणाली लगाने के लिए सब्सिडी देता है। इनसे 40-50% तक पानी की बचत होती है, खाद सीधे जड़ तक पहुंचती है और मज़दूरी भी घटती है।',
      'सब्सिडी की राशि फसल और राज्य के हिसाब से अलग हो सकती है। सब्ज़ी, फल और बाग़वानी फसलों में ड्रिप सबसे ज़्यादा फ़ायदेमंद रहती है। आवेदन राज्य के बागवानी / कृषि विभाग के ज़रिए होता है।'
    ]),
    descriptionEn: L([
      'The "Per Drop More Crop" part of the PM Krishi Sinchayee Yojana subsidises micro-irrigation such as drip and sprinkler systems. They save 40-50% of water, deliver fertiliser straight to the root and cut labour.',
      'The subsidy amount can vary by crop and state. Drip works best for vegetables, fruits and horticulture crops. Applications go through your state horticulture / agriculture department.'
    ]),
    eligibility: L(['अपनी ज़मीन वाले किसान (कुछ राज्यों में पट्टेदार भी)', 'छोटे-सीमांत किसानों को अधिक सब्सिडी', 'सिंचाई का स्रोत (बोरिंग/कुआं/तालाब) उपलब्ध हो']),
    eligibilityEn: L(['Farmers with their own land (tenants in some states)', 'Higher subsidy for small-marginal farmers', 'A water source (borewell/well/pond) should be available']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'ज़मीन के कागज़', 'सिंचाई स्रोत का विवरण', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Land records', 'Details of water source', 'Passport size photo']),
    howToApply: L(['अपने ज़िले के उद्यान / कृषि विभाग या राज्य के DBT पोर्टल पर रजिस्ट्रेशन करें', 'ड्रिप/स्प्रिंकलर के लिए ऑनलाइन आवेदन करें और ज़रूरी कागज़ अपलोड करें', 'स्वीकृति मिलने पर अधिकृत कंपनी से सेट लगवाएं', 'सत्यापन के बाद सब्सिडी सीधे खाते में या कंपनी को दी जाती है']),
    howToApplyEn: L(['Register with your district horticulture / agriculture department or the state DBT portal', 'Apply online for drip/sprinkler and upload documents', 'After approval, get the set installed by an authorised company', 'After verification the subsidy goes to your account or the company']),
    lastDate: 'राज्य द्वारा समय-समय पर घोषित — अपने कृषि/उद्यान विभाग से पूछें',
    lastDateEn: 'Announced by the state from time to time — ask your agriculture/horticulture department',
    officialLink: 'https://pmksy.gov.in',
    faqs: [
      { q: 'क्या सभी फसलों में ड्रिप लग सकती है?', qEn: 'Can drip be installed for every crop?', a: 'सब्ज़ी, फल, गन्ना, कपास जैसी कतार वाली फसलों में ड्रिप ठीक रहती है; गेहूं-धान जैसी फसलों में अक्सर स्प्रिंकलर या दूसरे तरीके सुझाए जाते हैं। अपने कृषि अधिकारी से सलाह लें।', aEn: 'Drip suits row crops like vegetables, fruits, sugarcane and cotton; for wheat or paddy sprinklers or other methods are usually suggested. Ask your agriculture officer.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'e-nam-online-mandi', icon: '🏪',
    title: 'ई-नाम (राष्ट्रीय कृषि बाज़ार)', titleEn: 'e-NAM (National Agriculture Market)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'ऑनलाइन मंडी — अपनी उपज देशभर के खरीदारों को बेचें और पैसा सीधे बैंक खाते में पाएं।',
    oneLineSummaryEn: 'Online mandi — sell your produce to buyers across India and get paid directly in your bank.',
    benefit: 'ज़्यादा खरीदार = बेहतर भाव; पारदर्शी नीलामी और सीधा बैंक भुगतान',
    benefitEn: 'More buyers = better price; transparent auction and direct bank payment',
    description: L([
      'ई-नाम एक ऑनलाइन ट्रेडिंग प्लेटफ़ॉर्म है जो देशभर की सैकड़ों मंडियों को आपस में जोड़ता है। किसान अपनी उपज मंडी में लाता है, उसकी गुणवत्ता जांच होती है और ऑनलाइन नीलामी में कई राज्यों के व्यापारी बोली लगाते हैं — इसलिए स्थानीय आढ़ती पर निर्भरता कम होती है।',
      'बिक्री का पैसा सीधे आपके बैंक खाते में आता है। किसान के लिए रजिस्ट्रेशन मुफ़्त है। 1,400 से ज़्यादा मंडियां इससे जुड़ चुकी हैं, पर आपकी नज़दीकी मंडी जुड़ी है या नहीं, यह enam.gov.in पर देखें।'
    ]),
    descriptionEn: L([
      'e-NAM is an online trading platform linking hundreds of mandis across India. The farmer brings produce to the mandi, it is quality-graded and traders from many states bid in an online auction — so you depend less on the local commission agent.',
      'Sale proceeds come straight into your bank account. Registration is free for farmers. Over 1,400 mandis are linked, but check on enam.gov.in whether your nearest mandi is one of them.'
    ]),
    eligibility: L(['कोई भी किसान जो अपनी उपज बेचना चाहता हो', 'आपकी नज़दीकी मंडी e-NAM से जुड़ी होनी चाहिए']),
    eligibilityEn: L(['Any farmer who wants to sell produce', 'Your nearby mandi must be linked with e-NAM']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक / IFSC कोड', 'मोबाइल नंबर', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook / IFSC code', 'Mobile number', 'Passport size photo']),
    howToApply: L(['enam.gov.in पर जाएं → "Farmer Registration" पर क्लिक करें', 'राज्य, मंडी, आधार, मोबाइल और बैंक विवरण भरें', 'या सीधे नज़दीकी e-NAM मंडी के कार्यालय में जाकर रजिस्ट्रेशन कराएं', 'उपज मंडी लाएं — गुणवत्ता जांच के बाद ऑनलाइन नीलामी में बिक्री होगी']),
    howToApplyEn: L(['Go to enam.gov.in → click "Farmer Registration"', 'Fill state, mandi, Aadhaar, mobile and bank details', 'Or register directly at the office of a nearby e-NAM mandi', 'Bring the produce to the mandi — after quality check it is sold in the online auction']),
    officialLink: 'https://enam.gov.in',
    faqs: [
      { q: 'क्या रजिस्ट्रेशन के लिए पैसे लगते हैं?', qEn: 'Does registration cost money?', a: 'नहीं, किसान का रजिस्ट्रेशन मुफ़्त है।', aEn: 'No, registration is free for farmers.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'agriculture-infrastructure-fund', icon: '🏗️',
    title: 'कृषि अवसंरचना कोष (AIF)', titleEn: 'Agriculture Infrastructure Fund (AIF)',
    ministry: 'कृषि एवं किसान कल्याण मंत्रालय', ministryEn: 'Ministry of Agriculture & Farmers Welfare',
    oneLineSummary: 'कोल्ड स्टोरेज, गोदाम, प्रोसेसिंग यूनिट लगाने के लिए ₹2 करोड़ तक लोन पर 3% ब्याज छूट।',
    oneLineSummaryEn: '3% interest relief on loans up to ₹2 crore to set up cold storage, warehouse or processing units.',
    benefit: '₹2 करोड़ तक के लोन पर 3% ब्याज छूट (7 साल तक) और क्रेडिट गारंटी',
    benefitEn: '3% interest subvention for 7 years on loans up to ₹2 crore, plus credit guarantee',
    description: L([
      'फसल कटने के बाद सही भंडारण और प्रोसेसिंग न होने से किसान की उपज सस्ते में बिकती है या खराब हो जाती है। इस ₹1 लाख करोड़ के कोष से किसान, किसान उत्पादक संगठन (FPO), सहकारी समितियां और कृषि उद्यमी गोदाम, कोल्ड स्टोरेज, छंटाई-ग्रेडिंग यूनिट, पैकिंग हाउस और प्राथमिक प्रोसेसिंग यूनिट बना सकते हैं।',
      'बैंक से मिलने वाले ₹2 करोड़ तक के लोन पर सालाना 3% ब्याज छूट 7 साल तक मिलती है और CGTMSE के तहत क्रेडिट गारंटी भी मिलती है। यानी बड़ी पूंजी के बिना भी अपनी यूनिट शुरू की जा सकती है।'
    ]),
    descriptionEn: L([
      'Without proper storage and processing after harvest, a farmer\'s produce sells cheap or spoils. From this ₹1 lakh crore fund, farmers, Farmer Producer Organisations (FPOs), cooperatives and agri-entrepreneurs can build warehouses, cold storage, sorting-grading units, pack houses and primary processing units.',
      'On bank loans up to ₹2 crore you get 3% interest relief per year for 7 years, plus a credit guarantee under CGTMSE. So you can start a unit without a large capital of your own.'
    ]),
    eligibility: L(['किसान, FPO, PACS / सहकारी समितियां, स्वयं सहायता समूह', 'कृषि उद्यमी और एग्री-स्टार्टअप', 'परियोजना फसल-कटाई के बाद के प्रबंधन या सामुदायिक खेती संपत्ति से जुड़ी हो']),
    eligibilityEn: L(['Farmers, FPOs, PACS / cooperatives, self-help groups', 'Agri-entrepreneurs and agri-startups', 'Project must relate to post-harvest management or community farming assets']),
    documentsRequired: L(['आधार कार्ड', 'पैन कार्ड', 'परियोजना रिपोर्ट (DPR)', 'ज़मीन के कागज़ / पट्टा', 'बैंक खाते का विवरण']),
    documentsRequiredEn: L(['Aadhaar Card', 'PAN card', 'Project report (DPR)', 'Land papers / lease', 'Bank account details']),
    howToApply: L(['agriinfra.dac.gov.in पर रजिस्ट्रेशन करें', 'परियोजना की रिपोर्ट (DPR) बनाकर पोर्टल पर अपलोड करें — बैंक या कृषि विभाग इसमें मदद करते हैं', 'पोर्टल से ही किसी भागीदार बैंक में लोन के लिए आवेदन करें', 'लोन स्वीकृत होने पर 3% ब्याज छूट खाते में समायोजित होती है']),
    howToApplyEn: L(['Register on agriinfra.dac.gov.in', 'Prepare a project report (DPR) and upload it — your bank or agriculture department can help', 'Apply for a loan to a participating bank through the portal itself', 'Once the loan is sanctioned the 3% interest relief is adjusted in your account']),
    officialLink: 'https://agriinfra.dac.gov.in',
    faqs: [
      { q: 'क्या छोटा किसान भी इसका फ़ायदा ले सकता है?', qEn: 'Can a small farmer benefit too?', a: 'हां — अकेला किसान, या अपने FPO / समिति / समूह के साथ मिलकर। छोटा गोदाम या ग्रेडिंग यूनिट भी इसमें आ सकती है।', aEn: 'Yes — alone, or together with your FPO / society / group. Even a small godown or grading unit can qualify.' }
    ]
  }),

  Object.assign({}, base, {
    slug: 'pm-matsya-sampada-yojana', icon: '🐟',
    title: 'प्रधानमंत्री मत्स्य संपदा योजना (PMMSY)', titleEn: 'PM Matsya Sampada Yojana (PMMSY)',
    ministry: 'मत्स्य पालन, पशुपालन एवं डेयरी मंत्रालय', ministryEn: 'Ministry of Fisheries, Animal Husbandry & Dairying',
    oneLineSummary: 'मछली पालन, हैचरी, बायोफ्लॉक और नाव-जाल पर 40% से 60% तक सब्सिडी।',
    oneLineSummaryEn: '40% to 60% subsidy on fish farming, hatcheries, biofloc units and boats/nets.',
    benefit: 'परियोजना लागत पर सामान्य वर्ग को 40% और महिला/SC/ST को 60% तक सब्सिडी',
    benefitEn: 'Subsidy of 40% for general and up to 60% for women/SC/ST on project cost',
    description: L([
      'खेती के साथ मछली पालन किसान की आय का भरोसेमंद ज़रिया है, खासकर बिहार जैसे जल-बहुल इलाक़ों में। PMMSY तालाब निर्माण, बायोफ्लॉक, रीसर्कुलेटरी एक्वाकल्चर सिस्टम (RAS), हैचरी, मछली पकड़ने की नाव-जाल, फ़िश फ़ीड मिल और कोल्ड चेन जैसी परियोजनाओं के लिए आर्थिक मदद देती है।',
      'सामान्य वर्ग को परियोजना लागत का 40% और महिला/अनुसूचित जाति/जनजाति को 60% तक सब्सिडी मिलती है। योजना की मौजूदा अवधि और आवेदन खिड़की के लिए अपने ज़िला मत्स्य कार्यालय या राज्य मत्स्य विभाग से पुष्टि कर लें।'
    ]),
    descriptionEn: L([
      'Fish farming alongside crops is a dependable income source, especially in water-rich regions like Bihar. PMMSY supports projects such as pond construction, biofloc, Recirculatory Aquaculture Systems (RAS), hatcheries, boats and nets, fish-feed mills and cold chain.',
      'General category gets 40% of project cost and women/SC/ST up to 60% as subsidy. Confirm the current scheme period and application window with your District Fisheries Office or state fisheries department.'
    ]),
    eligibility: L(['मछली पालक, मछुआरे, मत्स्य कृषक, FFPO, सहकारी समितियां, स्वयं सहायता समूह', 'महिला, SC/ST लाभार्थियों को अधिक सब्सिडी', 'अपनी ज़मीन या पट्टे पर तालाब / जल-क्षेत्र हो']),
    eligibilityEn: L(['Fish farmers, fishers, fish-culturists, FFPOs, cooperatives, self-help groups', 'Higher subsidy for women, SC/ST beneficiaries', 'Own or leased land / pond / water area']),
    documentsRequired: L(['आधार कार्ड', 'बैंक पासबुक', 'तालाब / ज़मीन के कागज़ या पट्टा', 'जाति प्रमाण पत्र (यदि लागू हो)', 'परियोजना रिपोर्ट', 'पासपोर्ट साइज़ फोटो']),
    documentsRequiredEn: L(['Aadhaar Card', 'Bank passbook', 'Pond / land papers or lease', 'Caste certificate (if applicable)', 'Project report', 'Passport size photo']),
    howToApply: L(['अपने ज़िला मत्स्य कार्यालय (District Fisheries Officer) से संपर्क करें', 'परियोजना का प्रस्ताव और ज़रूरी कागज़ जमा करें', 'आवेदन ऑनलाइन भी हो सकता है — pmmsy.dof.gov.in देखें', 'स्वीकृति और बैंक लोन के बाद काम शुरू करें; सब्सिडी सत्यापन के बाद मिलती है']),
    howToApplyEn: L(['Contact your District Fisheries Officer', 'Submit the project proposal and documents', 'Application may also be online — see pmmsy.dof.gov.in', 'Start work after approval and bank loan; subsidy is released after verification']),
    officialLink: 'https://pmmsy.dof.gov.in',
    faqs: [
      { q: 'क्या बिना अनुभव के मछली पालन शुरू कर सकते हैं?', qEn: 'Can I start without experience?', a: 'हां, पर पहले ज़िला मत्स्य कार्यालय या कृषि विज्ञान केंद्र से प्रशिक्षण ज़रूर लें — कई जगह यह मुफ़्त मिलता है।', aEn: 'Yes, but first take training from the District Fisheries Office or KVK — it is often free.' }
    ]
  })

  );
})();
