// Playground scene catalogue. The 5 keys match the i18n keys under
// main.playground.scenes so the banner labels translate automatically.
export type SceneKey =
  | 'ecommerce'
  | 'leads'
  | 'social'
  | 'realestate'
  | 'hospitality';

export const SCENES: SceneKey[] = [
  'ecommerce',
  'leads',
  'social',
  'realestate',
  'hospitality',
];

// Each scene maps to a short narrative the placeholder scene renders so users
// can see what kind of recording they'd capture if they hit Record here.
export interface SceneNarrative {
  key: SceneKey;
  steps: string[];
  output: string;
}

export const SCENE_NARRATIVES: Record<SceneKey, SceneNarrative> = {
  ecommerce: {
    key: 'ecommerce',
    steps: [
      'Open the supplier portal',
      'Click New Purchase Order',
      'Fill SKU, quantity, delivery date',
      'Submit',
    ],
    output: 'create-purchase-order.SKILL.md',
  },
  leads: {
    key: 'leads',
    steps: [
      'Open the business directory',
      'Filter by industry + city',
      'Click Apply',
      'Export selected leads as CSV',
    ],
    output: 'search-business-directory.SKILL.md',
  },
  social: {
    key: 'social',
    steps: [
      'Sign in to the analytics dashboard',
      'Switch the date range to "Last 7 Days"',
      'Open the CSV export menu',
      'Download report',
    ],
    output: 'export-weekly-dashboard.SKILL.md',
  },
  realestate: {
    key: 'realestate',
    steps: [
      'Open the listings site',
      'Set bedroom + price filters',
      'Save the search',
      'Email the result link',
    ],
    output: 'save-listings-search.SKILL.md',
  },
  hospitality: {
    key: 'hospitality',
    steps: [
      'Open the hotel search engine',
      'Pick dates and city',
      'Sort by lowest price',
      'Copy the top result URL',
    ],
    output: 'compare-hotel-prices.SKILL.md',
  },
};
