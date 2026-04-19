// TabTherapist Constants
// Eşik değerler ve kişilik tipi aralıkları

const THRESHOLDS = {
  tabHoarder: 30,
  moderateUser: 15,
  minimalist: 5
};

const PERSONALITY_TYPES = {
  aspirational: { min: 80, max: 100, name: 'Aspirational' },
  balanced: { min: 50, max: 79, name: 'Balanced' },
  relaxed: { min: 20, max: 49, name: 'Relaxed' },
  hoarder: { min: 0, max: 19, name: 'Hoarder' }
};

const STORAGE_KEYS = {
  tabHistory: 'tabHistory',
  tabStats: 'tabStats',
  lastAnalysis: 'lastAnalysis'
};

module.exports = { THRESHOLDS, PERSONALITY_TYPES, STORAGE_KEYS };
