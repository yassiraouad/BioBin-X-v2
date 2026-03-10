// utils/quizData.js
export const quizQuestions = [
  {
    id: 1,
    question: 'Hvor mye matavfall produserer en gjennomsnittlig norsk familie per år?',
    options: ['10–20 kg', '40–80 kg', '150–200 kg', '300+ kg'],
    correct: 1,
    explanation: 'En gjennomsnittlig norsk familie kaster mellom 40–80 kg mat per år.',
    category: 'matavfall',
  },
  {
    id: 2,
    question: 'Hva er biogass laget av?',
    options: ['Olje og gass', 'Organisk avfall som mat og slam', 'Kull og mineraler', 'Plast og metall'],
    correct: 1,
    explanation: 'Biogass produseres ved nedbryting av organisk materiale som matavfall og kloakkslam.',
    category: 'biogass',
  },
  {
    id: 3,
    question: 'Hvilken klimagass produseres mest fra matavfall på søppelfyllinger?',
    options: ['CO₂', 'Metan (CH₄)', 'Lystgass (N₂O)', 'Ozon (O₃)'],
    correct: 1,
    explanation: 'Metan er 25× kraftigere enn CO₂ som klimagass og produseres i store mengder fra matavfall på søppelfyllinger.',
    category: 'klima',
  },
  {
    id: 4,
    question: 'Omtrent hvor mye CO₂ spares per kg matavfall som omdannes til biogass?',
    options: ['0.1 kg', '0.8 kg', '5 kg', '10 kg'],
    correct: 1,
    explanation: 'Hvert kg matavfall som omdannes til biogass sparer omtrent 0.8 kg CO₂ sammenlignet med deponering.',
    category: 'biogass',
  },
  {
    id: 5,
    question: 'Hva brukes biogass hovedsakelig til?',
    options: ['Å lage plast', 'Varme og elektrisitet', 'Vanning av planter', 'Kjøling'],
    correct: 1,
    explanation: 'Biogass brukes primært til å produsere varme og elektrisitet, og kan også brukes som drivstoff.',
    category: 'biogass',
  },
  {
    id: 6,
    question: 'Hvilken mattype utgjør mest matavfall i norske husholdninger?',
    options: ['Kjøtt', 'Brød og bakevarer', 'Grønnsaker og frukt', 'Meieriprodukter'],
    correct: 2,
    explanation: 'Grønnsaker og frukt utgjør den største andelen av matavfallet i norske hjem.',
    category: 'matavfall',
  },
  {
    id: 7,
    question: 'Hva er det globale målet for reduksjon av matavfall innen 2030?',
    options: ['10% reduksjon', '25% reduksjon', '50% reduksjon', '75% reduksjon'],
    correct: 2,
    explanation: 'FNs bærekraftsmål 12.3 sier at vi skal halvere matavfallet globalt innen 2030.',
    category: 'klima',
  },
  {
    id: 8,
    question: 'Hvor mange prosent av verdens matproduksjon kastes som avfall?',
    options: ['5%', '10%', '33%', '60%'],
    correct: 2,
    explanation: 'Omtrent en tredjedel (33%) av all mat som produseres globalt kastes som avfall.',
    category: 'matavfall',
  },
];

export const categoryColors = {
  matavfall: '#22c55e',
  biogass: '#84cc16',
  klima: '#eab308',
};
