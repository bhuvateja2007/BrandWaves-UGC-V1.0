import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMarketplaceDataIntegrity, CREATORS, BRANDS, PRODUCTS, CAMPAIGNS } from '../../src/data/marketplaceData.ts';

test('Marketplace data integrity: counts, IDs and relationships', () => {
  const result = validateMarketplaceDataIntegrity();
  
  if (!result.isValid) {
    console.error('Data Integrity Errors:\n', result.errors.join('\n'));
  }
  
  assert.equal(result.isValid, true, `Marketplace data integrity check failed with ${result.errors.length} errors`);
  assert.equal(result.creatorCount, 18, 'Must have exactly 18 creators');
  assert.equal(result.brandCount, 10, 'Must have exactly 10 brands');
  assert.equal(result.productCount, 24, 'Must have exactly 24 products');
  assert.equal(result.campaignCount, 10, 'Must have exactly 10 campaigns');
});

test('Marketplace creators: 16 Indian and 2 International identities', () => {
  const indianCreators = CREATORS.filter(c => c.country === 'India');
  const internationalCreators = CREATORS.filter(c => c.country !== 'India');
  
  assert.equal(indianCreators.length, 16, 'Must have 16 Indian creators');
  assert.equal(internationalCreators.length, 2, 'Must have 2 international creators (UK and USA)');
  
  const ukCreator = CREATORS.find(c => c.country === 'UK');
  const usaCreator = CREATORS.find(c => c.country === 'USA');
  assert.ok(ukCreator, 'Olivia Bennett (London, UK) must be present');
  assert.ok(usaCreator, 'Ethan Brooks (Austin, USA) must be present');
  assert.equal(ukCreator.name, 'Olivia Bennett');
  assert.equal(usaCreator.name, 'Ethan Brooks');
});

test('Marketplace brands: exactly the 10 locked identities', () => {
  const expectedBrandNames = [
    'Crimson Pop',
    'Dew Theory',
    'Northlane Studio',
    'VoltEdge',
    'Form & Motion',
    'Ember Roast',
    'Roamwell',
    'Haven & Hue',
    'LoopKind',
    'Pawfolk',
  ];
  
  const actualNames = BRANDS.map(b => b.name);
  for (const name of expectedBrandNames) {
    assert.ok(actualNames.includes(name), `Brand "${name}" must be present in brands`);
  }
});

test('Marketplace campaigns: 10 campaigns with varied statuses', () => {
  const statuses = new Set(CAMPAIGNS.map(c => c.status));
  assert.ok(statuses.has('open'), 'Must have Open campaigns');
  assert.ok(statuses.has('in_progress'), 'Must have In Progress campaigns');
  assert.ok(statuses.has('completed'), 'Must have Completed campaigns');
});
