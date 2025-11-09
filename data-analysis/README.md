# Data Analysis

This is the folder where we will keep all the neccessary files for data analysis such as data files and Jupyter notebooks.

## Dataset

The dataset used in this project is the PISA (Programme for International Student Assessment) 2022 dataset. The dataset is collected here:
https://www.oecd.org/en/data/datasets/pisa-2022-database.html
Note: In order to access the dataset, you would need to fill out a quick survey before downloading the data.

### Technical Report

More information about the dataset is written in the techincal report linked below:
https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf

_Note: When I say pages in reference to the Techincal Report, I mean the page number when opened on PDF, not the actual pages in the technical report. The actual page number of the technical report would be -2 the page number of the PDF._

### Student Questionnaire

This is the questionnaire used to survey the students:
https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf

_Note: When I say pages in reference to the Student Questionnaire, I mean the page number when opened on PDF, not the actual pages in the questionnaire. This is not an issue as the PDF page number and the actual questionnaire page number are equal._

### 🚨 DO NOT UPLOAD THE FULL DATASET ONTO GITHUB. THE DATASET IS 2 GB, WHILE GITHUB ONLY ACCEPTS FILES UP TO 100 MiB 🚨

We have attached a cleaned subset of the data into this repo for easy data analysis under `data/student_subset.csv` (Thanks Josh).

## Major Assumptions

The cleaned dataset `data/student_subset.csv` takes the average of 10 values given for each subject (math, reading and science) for each student.

## Column Interpretation

For all variables in the dataset, we can reference the techinical report starting from Chapter 19. For our relavant variables used, start at page 388.

The main variables we will be focusing on are

### [ESCS - Index of economic, social and cultural status](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=403) (pg. 403)

The ESCS score was based on three indicators: highest parental occupation status (HISEI), highest education of parents in years (PAREDINT), and home possessions (HOMEPOS). The rationale for using these three components, which are consistent with the components used in previous PISA cycles, is that socio-economic status is most commonly theoretically conceptualized based on “the big 3” (occupational status, education, and income) (Cowan et al., 2012[13]). As no direct income measure is available in the PISA data, the existence of household items has been used as a proxy for family income.

### [AGE](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=388) (pg. 388)

```math
AGE = (100 + T_y - S_y) + \frac{T_m - S_m}{12}
```

where

- $T_y$ = Year test was given
- $S_y$ = Year of student's birth
- $T_m$ = Month test was given
- $S_m$ = Month of student's birth
  AGE is then rounded to 2 decimal places.

### [HISCED - Highest level of education of parents](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=389) (pg. 389)

Derived using student's response to questions [ST005, ST006, ST007, ST008](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=13). This value is equal to the highest ISCED value between the mother (MISCED) and father (FISCED).

### [HISEI - Highest parental accoupational status](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=390) (pg. 390)

This highest parental occupational status index (HISEI) was based on the 4-digit ISCO-08 occupational codes that were human coded from students’ responses to questions [ST014 and ST015](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=17) about their mother and father’s occupations, respectively. The index was equal to the higher of the mother’s (BMMJ1) and father’s (BFMJ2) ISEI scores.

### [BULLIED - Being buillied](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=394) (pg. 394)

Students’ ratings of how often they had a range of experiences at school that are indicative of being bullied during the past 12 months (e.g., “Other students left me out of things on purpose.”, “Other students made fun of me.”) in question [ST038](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=33) were scaled into the index of “Being bullied”. Each of the nine items included in this scale had four response options (“Never or almost never”, “A few times a year”, “A few times a month”, “Once a week or more”).

### [FEELSAFE - Feeling safe](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=394) (pg. 394)

Students’ ratings of their agreement with four statements about their perceived safety (e.g., “I feel safe on my way to school.”, “I feel safe in my classrooms at school.”) in question [ST265](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=34) were scaled into the index of “Feeling safe”. Each of the four items included in this scale had four response options (“Strongly agree”, “Agree”, “Disagree”, “Strongly disagree”).

### [BELONG - Sense of belonging](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=395) (pg. 395)

Students’ ratings of their agreement with six statements (e.g., “I feel like I belong at school.”, “I feel lonely at school.”) in question [ST034](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=32) were scaled into the index of “Sense of belonging”. Note that this scale used a within-construct matrix sampling design and that it was linked to the BELONG scale in PISA 2018. Each of the six items included in this scale had four response options (“Strongly agree”, “Agree”, “Disagree”, “Strongly disagree”).

### [ANXMAT - Mathematics anxiety](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=396) (pg. 396)

Students’ ratings of their agreement with statements about a range of attitudes towards mathematics (e.g., “I often worry that it will be difficult for me in mathematics classes.”, “I feel anxious about failing in mathematics.”) in question [ST292](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=69) were scaled into the index of “Mathematics anxiety”. Each of the six items included in this scale had four response options (“Strongly agree”, “Agree”, “Disagree”, “Strongly disagree”).

### [STRESAGR - Stress resistance](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=398) (pg. 398)

Students’ ratings of their agreement with statements about a range of behaviours indicative of stress resistance (e.g., “I remain calm under stress.”, “I get nervous easily.”) in question [ST345](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/COMPUTER-BASED%20STUDENT%20questionnaire%20PISA%202022.pdf#page=49) were scaled into the index of “Stress resistance”. Note that this scale used a within-construct matrix sampling design. Each of the 10 items included in this scale had five response options (“Strongly disagree”, “Disagree”, “Neither agree nor disagree”, “Agree”, “Strongly agree”).

### [PSYCHSYM - Psychosomatic symptoms](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=412) (pg. 412)

Students’ ratings of how often they experienced different psychosomatic symptoms (e.g., “Headache”, “Stomach pain”) in question [WB154](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/WELL-BEING%20QUESTIONNAIRE%20PISA%202022.pdf#page=7) were scaled into the index of “Psychosomatic symptoms”. Each of the nine items included in this scale had five response options (“Rarely or never”, “About every month”, “About every week”, “More than once a week”, “About every day”).

### [SOCCON - Social connections: Ease of communication about worries and concerns](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=412) (pg. 412-413)

Students’ ratings of how easy it is to communicate about their worries and concerns with different people (e.g., “Your father”, “Your brother(s)”) in question [WB162](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/WELL-BEING%20QUESTIONNAIRE%20PISA%202022.pdf#page=13) were scaled into the index of “Social connections: Ease of communication about worries and concerns”. Each of the nine items included in this scale had four substantive response options (“Very difficult”, “Difficult”, “Easy”, “Very Easy”) and an additional response option “I don’t have or see this person” which was recoded as missing prior to scaling. Table 19.A.107 shows the item wording and item parameters for the items in this scale.

### [EXPWB - Experienced well-being](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=413) (pg. 413)

Students’ responses regarding their experienced well-being in the previous day (e.g., “Were you treated with respect all day yesterday?”, “Did you smile or laugh a lot yesterday?”) in question [WB178](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/WELL-BEING%20QUESTIONNAIRE%20PISA%202022.pdf#page=27) were scaled into the index of “Experienced well-being – Previous day”. Each of the six items included in this scale had two response options (“Yes”, “No”). Note that prior to scaling, all responses were recoded as missing if the student did not respond “yes” to WB178Q07JA (“Was yesterday a typical day?”).

### [LIFESAT - Students' life satisfication across domains](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/03/pisa-2022-technical-report_599753f0/01820d6d-en.pdf#page=412) (pg. 412)

Students’ ratings of their satisfaction with different areas of their lives (e.g., “Your health”, “The neighbourhood you live in”) in question [WB155](https://www.oecd.org/content/dam/oecd/en/data/datasets/pisa/pisa-2022-datasets/questionnaires/WELL-BEING%20QUESTIONNAIRE%20PISA%202022.pdf#page=8) were scaled into the index of “Students’ life satisfaction across domains”. Each of the 10 items included in this scale had four response options (“Not at all satisfied”, “Not satisfied”, “Satisfied”, “Totally satisfied”).
