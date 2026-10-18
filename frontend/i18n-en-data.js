/* Source-aware English translations; keyed by the same stable source IDs.
 * These do not replace, derive, or edit the source records. */
window.MARIE_SOURCE_TRANSLATIONS = {
 riskDefinition:'A risk factor is a characteristic or exposure associated with a higher probability of developing a disease in a population. Its presence does not establish a diagnosis. This catalog distinguishes ovarian cancer risk factors, associations with lower risk, emerging evidence, and social context; it does not calculate an individual risk score.',
 categories:{
 'demographic':'Age and population',
 'hereditary':'Family history and hereditary predisposition',
 'reproductive':'Clinical, reproductive, and hormonal history',
 'metabolic':'Adiposity and metabolism',
 'dietary':'Nutrition and emerging evidence',
 'context':'Social and environmental context'
 },
 risk:{
 age:[
 'Older age','Epidemiologic pattern recognized by INCA.',
 'The incidence of epithelial ovarian carcinoma increases with age. Age stratification describes populations; it does not predict an individual’s likelihood of developing cancer.',
 'Available as age groups in PNS 2019. Age is a filter and does not, by itself, establish menopausal status.'
 ],
 family_history:[
 'Family history of ovarian cancer','Established risk factor; strong evidence in the NCI synthesis.',
 'A history in first-degree relatives, such as a mother, sister, or daughter, is associated with increased risk. Family history and genetic predisposition require specific information.',
 'Not available in the current PNS 2019 extract. A characteristic not recorded in the dashboard must not be interpreted as absent in an individual.'
 ],
 brca1_brca2:[
 'Pathogenic variants in BRCA1 or BRCA2','Hereditary predisposition recognized by INCA and NCI.',
 'Pathogenic germline variants in these genes increase susceptibility to ovarian cancer. Identification requires genetic assessment; these variants cannot be inferred from state of residence, age, or education.',
 'Not available in the current PNS 2019 extract. A characteristic not recorded in the dashboard must not be interpreted as absent in an individual.'
 ],
 lynch:[
 'Lynch syndrome','Hereditary cancer syndrome recognized by the NCI.',
 'Lynch syndrome is associated with increased ovarian cancer risk. This catalog describes the epidemiologic association without assigning genetic diagnoses to respondents.',
 'Not available in the current PNS 2019 extract. A characteristic not recorded in the dashboard must not be interpreted as absent in an individual.'
 ],
 endometriosis:[
 'Endometriosis','Established association; varies by histologic subtype.',
 'The association with ovarian cancer is stronger for endometrioid and clear-cell carcinomas. Findings should not be generalized equally to every ovarian cancer subtype.',
 'Not available in the current PNS 2019 extract. A characteristic not recorded in the dashboard must not be interpreted as absent in an individual.'
 ],
 menopausal_hormone_therapy:[
 'Postmenopausal hormone therapy','Small association; moderate evidence in the NCI synthesis.',
 'Current or recent menopausal hormone therapy is associated with a small increase in risk. Time since last use, duration, and formulation matter in clinical assessment.',
 'Use, type, duration, and time since stopping are unavailable in this extract. Do not infer exposure from age or create a long-term-use category without duration data.'
 ],
 nulliparity:[
 'Nulliparity: no previous births','Epidemiologic association recognized by INCA.',
 'Women who have never given birth have higher risk than women who have given birth. Nulliparity means no previous births; nulligravidity means never having been pregnant.',
 'Pregnancy and childbirth history are unavailable in this extract. Do not infer nulliparity from age, marital status, or household composition.'
 ],
 childbirth_parity:[
 'Childbirth history: parity','Associated with lower risk in population studies.',
 'Having given birth is associated with lower risk compared with nulliparity. This is the same reproductive dimension as the preceding item: the two descriptions are not independent risk factors to be added together.',
 'Number of births and pregnancy history are unavailable in this extract. This information is not intended to guide reproductive decisions.'
 ],
 oral_contraceptives:[
 'Oral contraceptive use','Consistent association with lower risk; summarized by INCA and NCI.',
 'Oral contraceptive use is associated with lower ovarian cancer risk, influenced by duration and time since last use. This evidence should not be generalized to every hormonal contraceptive method.',
 'Type, duration, and history of use are unavailable in this extract. This catalog does not advise starting or stopping contraceptives.'
 ],
 breastfeeding:[
 'Breastfeeding history','Consistent association with lower risk in the NCI synthesis.',
 'Population studies associate breastfeeding with reduced ovarian cancer risk. Cumulative duration is part of exposure assessment.',
 'Breastfeeding history and duration are unavailable in this extract. Missing information does not imply never having breastfed.'
 ],
 menstrual_span:[
 'Early menarche and late menopause','Possible associations; retain the uncertainty described by INCA.',
 'INCA notes possible associations with early onset of menstruation and late menopause. No classification thresholds or scores from breast cancer risk tables have been applied.',
 'Age at menarche and menopausal status or age are unavailable in this extract. Age group does not substitute for these variables.'
 ],
 adiposity:[
 'Adiposity and elevated BMI','Recognized association, generally modest and context-dependent.',
 'INCA and NCI link higher adiposity with ovarian cancer. The NCI describes a modest BMI association, with differences according to hormone therapy use. BMI does not provide an individual cancer probability.',
 'Available: BMI ≥30 kg/m² using reported weight and height, including IBGE imputations. Pregnant respondents and respondents with unknown pregnancy status are excluded. This is not a postmenopausal obesity measure because menopausal status was not extracted.'
 ],
 ultra_processed:[
 'Ultra-processed foods: observational association','Prospective observational association; causality not established.',
 'Chang and colleagues reported higher ovarian cancer incidence and mortality in the UK Biobank with a greater proportion of ultra-processed foods by dietary weight. The study neither establishes causation nor provides individual risk estimates applicable to PNS.',
 'The available PNS data measure food groups consumed on the previous day, not the proportion by dietary weight used in the UK Biobank. Its hazard ratios therefore cannot be applied to PNS subgroups.'
 ],
 citrus:[
 'Citrus and flavanones','Observational evidence for prevention is inconclusive.',
 'Findings on flavanones do not establish that oranges or orange juice prevent ovarian cancer. In the Cassidy study, analyses of oranges and orange juice as individual foods did not show statistically significant associations.',
 'PNS general fruit and food-group variables neither isolate citrus nor quantify flavanones. This extract lacks a specific measure of this exposure.'
 ],
 alcohol:[
 'Alcohol: ovarian-cancer-specific association uncertain','A specific association is not established in the NCI synthesis.',
 'The NCI does not identify a clear association between alcohol consumption and ovarian cancer. Inclusion in an original breast cancer table does not justify treating alcohol as an established ovarian cancer risk factor here.',
 'The current extract contains no alcohol indicator. No prevalence estimate or risk category has been invented for this exposure.'
 ],
 water:[
 'Water supply and household treatment','Infrastructure and living-conditions indicators.',
 'In this dashboard, water indicators characterize household and territorial contexts. Piped network water and domestic treatment do not measure contaminants, exposure dose, or laboratory-confirmed drinking-water quality.',
 'Contextual indicators are available from PNS 2019 and the 2022 Census, with different reference populations. They do not classify an individual’s susceptibility to ovarian cancer.'
 ],
 education:[
 'Educational attainment','Social stratification variable; no cancer-risk coefficient.',
 'Education describes socioeconomic differences between observed groups. It is used to organize descriptive analyses, not converted to biologic predisposition or cancer probability.',
 'Available for stratification and description in PNS 2019. It is not a clinical measure of ovarian cancer risk.'
 ],
 idhm:[
 'Human Development Index and education component','Area-level human development context.',
 'The HDI combines longevity, education, and income at population level. State comparisons in this dashboard are ecological and do not represent an individual’s ovarian cancer risk.',
 'Available as contextual data from sources outside PNS. Retain the source year; the index is not equivalent to a respondent’s education.'
 ]
 },
 evidence:{
 'Flavanonas na dieta — análise geral':['Dietary flavanones — overall analysis','Lower point estimate in the highest quintile; the interval reaches 1.00 and no significant trend was observed across quintiles.','Highest versus lowest flavanone intake quintile; median 75.8 versus 7.8 mg/day','Observational association, dietary exposure estimated by questionnaires, and possible residual confounding. This concerns a compound subclass, not oranges alone or an absolute reduction in risk.'],
 'Flavanonas — tumores serosos invasivos e pouco diferenciados':['Flavanones — invasive, poorly differentiated serous tumors','Inverse association in the extreme-quintile comparison within this subgroup.','Highest versus lowest flavanone intake quintile','Observational subgroup analysis. The heterogeneity test did not establish a difference between histologic groups (p=0.10). Do not interpret this as proven protection against all ovarian cancer subtypes.'],
 'Laranja como alimento':['Oranges as a food','The association between oranges alone and ovarian cancer was not statistically significant.','At least 5 orange servings/week versus fewer than 1/month','The interval includes no association and effects in both directions. Do not assign to oranges the HR reported for flavanones.'],
 'Suco de laranja como alimento':['Orange juice as a food','The association between orange juice alone and ovarian cancer was not statistically significant.','At least 1 orange juice serving/day versus fewer than 1/month','The interval includes 1.00. This food category is not a dietary prescription or a preventive dose.'],
 'Síntese posterior — flavanonas e câncer de ovário':['Later synthesis — flavanones and ovarian cancer','The pooled analysis found no statistically significant association for flavanones and showed high heterogeneity.','Highest versus lowest flavanone consumption category','Only two studies contributed to this estimate. The review includes more studies of other subclasses; that total should not be attributed to flavanones. The meta-analysis reuses earlier evidence and is not an independent new cohort.']
 },
 mechanisms:{
 'Hesperidina':['Hesperidin','Reduced cell viability with signs of apoptosis and endoplasmic reticulum stress under experimental conditions.','Cell culture findings cannot establish prevention efficacy in women, a food dose, or supplement benefits.'],
 'Naringenina':['Naringenin','Reduced proliferation and cell migration, changes in PI3K signaling, and reduced tumor growth in an animal model; microbiota changes were also evaluated.','Experiments with an isolated compound do not show that eating citrus prevents or treats cancer in humans. Naringenin and naringin are different substances.'],
 '(+)-Limoneno 1,2-epóxido, derivado do limoneno':['(+)-Limonene 1,2-epoxide, a limonene derivative','The derivative showed cytotoxic activity under the study’s experimental conditions.','Limonene is a monoterpene, not a flavanone. This experiment uses a chemical derivative, not oranges, juice, or dietary limonene, and does not demonstrate clinical prevention.']
 }
};
