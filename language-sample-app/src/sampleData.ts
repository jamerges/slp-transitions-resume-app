import type { ProbeItem } from './engine/types'
import type { StimulabilityMap } from './engine/types'

// Demo case: simulated 4;6 child with velar fronting (k,g→t,d), stopping
// (s,z,θ,ð→t,d,f), gliding (r,l→w), depalatalization (ʃ→s, tʃ→ts), and
// cluster reduction. Illustrative only — not real client data.

let n = 0
const item = (word: string, targetIpa: string, actualIpa: string): ProbeItem => ({
  id: 'demo-' + ++n,
  word,
  targetIpa,
  actualIpa,
})

export const DEMO_ITEMS: ProbeItem[] = [
  item('pig', 'pɪg', 'pɪd'),
  item('key', 'ki', 'ti'),
  item('cat', 'kæt', 'tæt'),
  item('go', 'goʊ', 'doʊ'),
  item('girl', 'gɝl', 'dɝw'),
  item('sun', 'sʌn', 'tʌn'),
  item('sock', 'sɑk', 'tɑt'),
  item('soap', 'soʊp', 'toʊp'),
  item('fish', 'fɪʃ', 'fɪs'),
  item('shoe', 'ʃu', 'su'),
  item('red', 'rɛd', 'wɛd'),
  item('rabbit', 'ræbɪt', 'wæbɪt'),
  item('leaf', 'lif', 'wif'),
  item('lamp', 'læmp', 'wæmp'),
  item('watch', 'wɑtʃ', 'wɑts'),
  item('jump', 'dʒʌmp', 'dʌmp'),
  item('chair', 'tʃɛr', 'tɛw'),
  item('spoon', 'spun', 'pun'),
  item('star', 'stɑr', 'tɑw'),
  item('snake', 'sneɪk', 'neɪt'),
  item('sky', 'skaɪ', 'taɪ'),
  item('tree', 'tri', 'ti'),
  item('blue', 'blu', 'bu'),
  item('thumb', 'θʌm', 'fʌm'),
  item('this', 'ðɪs', 'dɪt'),
  item('feather', 'fɛðɚ', 'fɛdɚ'),
  item('house', 'haʊs', 'haʊt'),
  item('hand', 'hænd', 'hænd'),
  item('nose', 'noʊz', 'noʊd'),
  item('zip', 'zɪp', 'dɪp'),
  item('van', 'væn', 'bæn'),
  item('ring', 'rɪŋ', 'wɪn'),
  item('ball', 'bɔl', 'bɔw'),
  item('dog', 'dɔg', 'dɔd'),
  item('two', 'tu', 'tu'),
  item('pie', 'paɪ', 'paɪ'),
  item('bee', 'bi', 'bi'),
  item('knife', 'naɪf', 'naɪf'),
  item('map', 'mæp', 'mæp'),
  item('web', 'wɛb', 'wɛb'),
  item('yo-yo', 'joʊjoʊ', 'joʊjoʊ'),
]

export const DEMO_STIMULABILITY: StimulabilityMap = {
  k: 60,
  g: 40,
  r: 0,
  l: 10,
  θ: 0,
  ð: 0,
  ʃ: 20,
  'tʃ': 10,
  v: 70,
  z: 50,
}

export const DEMO_CLIENT = { name: 'Demo Child', ageYears: 4, ageMonths: 6 }
