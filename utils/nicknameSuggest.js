// Generates a fun Turkish nickname by combining a random adjective and noun.
// Pure function, no dependencies. Used to prefill the guest nickname sheet.

const ADJECTIVES = [
  'Bilge',
  'Çevik',
  'Atik',
  'Cesur',
  'Gizemli',
  'Kıvrak',
  'Yaman',
  'Usta',
  'Sırlı',
  'Hızlı',
  'Keskin',
  'Korkusuz',
  'Şanslı',
  'Görkemli',
];

const NOUNS = [
  'Kâşif',
  'Kartal',
  'Düşünür',
  'Şahin',
  'Dahi',
  'Gezgin',
  'Avcı',
  'Bilgin',
  'Fatih',
  'Yıldız',
  'Pars',
  'Ejder',
  'Şövalye',
  'Usta',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Returns a random Turkish nickname like "Bilge Kâşif".
 * @returns {string}
 */
export function randomNickname() {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}
