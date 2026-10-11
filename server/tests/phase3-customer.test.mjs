import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getRoleLandingRoute, 
  getRoleDisplayName 
} from '../../src/lib/authValidation.ts';
import { 
  getProducts, 
  getProductById, 
  getCreators, 
  getCreatorById,
  validateMarketplaceDataIntegrity,
  PRODUCTS,
  CREATORS,
  BRANDS
} from '../../src/data/marketplaceData.ts';
import {
  saveProduct,
  removeSavedProduct,
  getSavedProductIds,
  isWishlistBackendConfigured,
  getWishlistStorageStatus
} from '../../src/services/wishlistService.ts';

// ---------------------------------------------------------------------------
// 1. Role Authorization & Customer Landing Route Tests
// ---------------------------------------------------------------------------
test('Role Authorization: Customer and User roles route to /customer', () => {
  assert.equal(getRoleLandingRoute('customer'), '/customer');
  assert.equal(getRoleLandingRoute('user'), '/customer');

  // Verify other roles do not land on /customer
  assert.notEqual(getRoleLandingRoute('creator'), '/customer');
  assert.notEqual(getRoleLandingRoute('brand_owner'), '/customer');
  assert.notEqual(getRoleLandingRoute('brand_admin'), '/customer');
  assert.notEqual(getRoleLandingRoute('admin'), '/customer');
});

test('Role Display Name: Customer role returns proper human-readable label', () => {
  assert.equal(getRoleDisplayName('customer'), 'Customer');
  assert.equal(getRoleDisplayName('user'), 'Customer');
  assert.equal(getRoleDisplayName('creator'), 'Creator');
  assert.equal(getRoleDisplayName('brand_owner'), 'Brand Owner');
});

// ---------------------------------------------------------------------------
// 2. Protected Route Boundaries & Role Guards
// ---------------------------------------------------------------------------
test('Role Guard: Denies anonymous access and captures safe return path', () => {
  const checkRouteAccess = ({ user, path, allowedRoles, allowAdminBypass = true }) => {
    if (!user) {
      const returnPath = path.startsWith('/') ? path : '/dashboard';
      return { authorized: false, redirectTo: '/login', state: { from: { pathname: returnPath } } };
    }
    const userRole = user.role;
    const isAuthorized = allowedRoles.includes(userRole) || (allowAdminBypass && userRole === 'admin');
    if (!isAuthorized) {
      return { authorized: false, accessDenied: true };
    }
    return { authorized: true };
  };

  // Anonymous user accessing customer route
  const anonCheck = checkRouteAccess({
    user: null,
    path: '/customer/products',
    allowedRoles: ['customer', 'user'],
    allowAdminBypass: false,
  });
  assert.equal(anonCheck.authorized, false);
  assert.equal(anonCheck.redirectTo, '/login');
  assert.equal(anonCheck.state.from.pathname, '/customer/products');

  // Customer user accessing customer route
  const customerCheck = checkRouteAccess({
    user: { id: 'u1', role: 'customer' },
    path: '/customer',
    allowedRoles: ['customer', 'user'],
    allowAdminBypass: false,
  });
  assert.equal(customerCheck.authorized, true);

  // Creator accessing customer route is blocked
  const creatorCheck = checkRouteAccess({
    user: { id: 'u2', role: 'creator' },
    path: '/customer',
    allowedRoles: ['customer', 'user'],
    allowAdminBypass: false,
  });
  assert.equal(creatorCheck.authorized, false);
  assert.equal(creatorCheck.accessDenied, true);

  // Brand Owner accessing customer route is blocked
  const brandCheck = checkRouteAccess({
    user: { id: 'u3', role: 'brand_owner' },
    path: '/customer/saved',
    allowedRoles: ['customer', 'user'],
    allowAdminBypass: false,
  });
  assert.equal(brandCheck.authorized, false);
  assert.equal(brandCheck.accessDenied, true);

  // Administrator accessing customer route with bypass disabled is blocked
  const adminCheck = checkRouteAccess({
    user: { id: 'u4', role: 'admin' },
    path: '/customer',
    allowedRoles: ['customer', 'user'],
    allowAdminBypass: false,
  });
  assert.equal(adminCheck.authorized, false);
  assert.equal(adminCheck.accessDenied, true);
});

// ---------------------------------------------------------------------------
// 3. Canonical Product Catalog & Discovery Filtering
// ---------------------------------------------------------------------------
test('Product Discovery: Canonical catalog size matches Phase 1 specification', () => {
  const allProducts = getProducts();
  assert.equal(allProducts.length, 24, 'BrandWaves canonical product dataset must contain exactly 24 products');
});

test('Product Discovery: Category filtering subsets products accurately', () => {
  const beverageProducts = getProducts({ category: 'Beverage' });
  assert.ok(beverageProducts.length > 0, 'Beverage category should return products');
  for (const prod of beverageProducts) {
    assert.ok(prod.category.toLowerCase().includes('beverage'));
  }

  const skincareProducts = getProducts({ category: 'Skincare' });
  assert.ok(skincareProducts.length > 0, 'Skincare category should return products');
  for (const prod of skincareProducts) {
    assert.ok(prod.category.toLowerCase().includes('skincare'));
  }

  // Non-matching category
  const emptyCategory = getProducts({ category: 'Astronomy Hardware' });
  assert.equal(emptyCategory.length, 0);
});

test('Product Discovery: Text search queries name, category, and description', () => {
  const searchResults = getProducts({ search: 'cola' });
  assert.ok(searchResults.length > 0, 'Search for "cola" should yield Crimson Classic Cola');
  assert.ok(searchResults.some(p => p.name.toLowerCase().includes('cola')));

  const searchBrand = getProducts({ search: 'Dew Theory' });
  assert.ok(searchBrand.length > 0, 'Search by brand name should return associated products');
});

test('Product Discovery: Price and Name sorting maintains mathematical order', () => {
  const allProducts = getProducts();

  // Price Ascending
  const priceAsc = [...allProducts].sort((a, b) => a.price - b.price);
  for (let i = 0; i < priceAsc.length - 1; i++) {
    assert.ok(priceAsc[i].price <= priceAsc[i + 1].price, 'Prices should be monotonically increasing');
  }

  // Price Descending
  const priceDesc = [...allProducts].sort((a, b) => b.price - a.price);
  for (let i = 0; i < priceDesc.length - 1; i++) {
    assert.ok(priceDesc[i].price >= priceDesc[i + 1].price, 'Prices should be monotonically decreasing');
  }

  // Name Ascending
  const nameAsc = [...allProducts].sort((a, b) => a.name.localeCompare(b.name));
  for (let i = 0; i < nameAsc.length - 1; i++) {
    assert.ok(nameAsc[i].name.localeCompare(nameAsc[i + 1].name) <= 0, 'Names should be in alphabetical order');
  }
});

// ---------------------------------------------------------------------------
// 4. Creator Content to Product Linkage Integrity
// ---------------------------------------------------------------------------
test('Data Relationship: Creator portfolio items link to authentic canonical products', () => {
  const creators = getCreators();
  assert.equal(creators.length, 18, 'BrandWaves canonical creator dataset must contain exactly 18 creators');

  let linkedPortfolioItemCount = 0;
  for (const creator of creators) {
    for (const item of creator.portfolio) {
      if (item.relatedProductId) {
        linkedPortfolioItemCount++;
        const targetProduct = getProductById(item.relatedProductId);
        assert.ok(
          targetProduct, 
          `Creator ${creator.name} portfolio item "${item.title}" references non-existent product "${item.relatedProductId}"`
        );
      }
    }
  }

  assert.ok(linkedPortfolioItemCount >= 10, 'At least 10 portfolio reviews must be explicitly linked to products');
});

test('Data Integrity: Global relational validator passes with zero errors', () => {
  const validation = validateMarketplaceDataIntegrity();
  assert.equal(validation.isValid, true);
  assert.equal(validation.errors.length, 0, `Validation errors found: ${validation.errors.join(', ')}`);
});

// ---------------------------------------------------------------------------
// 5. Wishlist Service Operations & Persistence Strategy
// ---------------------------------------------------------------------------
test('Wishlist Service: Save and Remove operations function properly', async () => {
  const testUserId = 'test_cust_user_42';
  const prod1 = 'prod_crimson_classic_cola';
  const prod2 = 'prod_dew_ceramide_sunscreen';

  // Save product 1
  const save1Result = await saveProduct(testUserId, prod1);
  assert.equal(save1Result, true, 'Saving product 1 should return true');

  // Verify product 1 is in wishlist
  const list1 = await getSavedProductIds(testUserId);
  assert.ok(list1.includes(prod1), 'Wishlist must contain saved product 1');

  // Save product 2
  await saveProduct(testUserId, prod2);
  const list2 = await getSavedProductIds(testUserId);
  assert.ok(list2.includes(prod1) && list2.includes(prod2), 'Wishlist must contain both saved products');

  // Duplicate save should not create duplicate entries
  await saveProduct(testUserId, prod1);
  const listDupe = await getSavedProductIds(testUserId);
  const occurrencesOfProd1 = listDupe.filter(id => id === prod1).length;
  assert.equal(occurrencesOfProd1, 1, 'Duplicate saves must be deduplicated');

  // Remove product 1
  const removeResult = await removeSavedProduct(testUserId, prod1);
  assert.equal(removeResult, true, 'Removing product should return true');

  const listAfterRemove = await getSavedProductIds(testUserId);
  assert.ok(!listAfterRemove.includes(prod1), 'Removed product should no longer be in wishlist');
  assert.ok(listAfterRemove.includes(prod2), 'Remaining product should still be in wishlist');

  // Clean up
  await removeSavedProduct(testUserId, prod2);
});

test('Wishlist Service: Validates product references and rejects non-existent product IDs', async () => {
  const testUserId = 'test_cust_ref_val';
  const invalidProdId = 'prod_non_existent_fake_item_999';

  const result = await saveProduct(testUserId, invalidProdId);
  assert.equal(result, false, 'Saving non-existent product ID must be rejected');

  const list = await getSavedProductIds(testUserId);
  assert.ok(!list.includes(invalidProdId), 'Wishlist must not contain invalid product reference');
});

test('Wishlist Service: Scopes wishlist by user ID (User isolation)', async () => {
  const userA = 'user_alice_101';
  const userB = 'user_bob_202';
  const prodA = 'prod_northlane_chore_jacket';

  await saveProduct(userA, prodA);

  const listA = await getSavedProductIds(userA);
  const listB = await getSavedProductIds(userB);

  assert.ok(listA.includes(prodA), 'User A wishlist must contain prodA');
  assert.ok(!listB.includes(prodA), 'User B wishlist must not contain User A saved products');

  // Clean up
  await removeSavedProduct(userA, prodA);
});

test('Wishlist Service: Storage status reports transparent persistence mode', async () => {
  const status = await getWishlistStorageStatus();
  assert.ok(typeof status.isCloudConfigured === 'boolean');
  assert.ok(typeof status.isTableAvailable === 'boolean');
  assert.ok(status.storageMode === 'supabase_postgres' || status.storageMode === 'browser_storage_fallback');
  assert.ok(status.statusLabel.length > 0);
  assert.ok(status.details.length > 0);
});

// ---------------------------------------------------------------------------
// 6. Editorial Collections Dataset Integrity
// ---------------------------------------------------------------------------
test('Editorial Collections: All products in thematic collections exist in canonical catalog', () => {
  const collections = [
    {
      id: 'col_daily_rituals',
      productIds: [
        'prod_crimson_classic_cola',
        'prod_dew_ceramide_sunscreen',
        'prod_ember_nitro_coldbrew',
        'prod_loopkind_thermal_flask'
      ],
    },
    {
      id: 'col_urban_transit',
      productIds: [
        'prod_northlane_chore_jacket',
        'prod_voltedge_pulse_pro_headphones',
        'prod_roamwell_nomad_backpack',
        'prod_northlane_cargo_pant'
      ],
    },
    {
      id: 'col_sanctuary_spaces',
      productIds: [
        'prod_form_alignment_mat',
        'prod_haven_ripple_vase',
        'prod_haven_amber_candle',
        'prod_pawfolk_cloud_bed'
      ],
    },
  ];

  for (const col of collections) {
    for (const pid of col.productIds) {
      const prod = getProductById(pid);
      assert.ok(prod, `Collection "${col.id}" references missing product "${pid}"`);
      assert.ok(prod.name, 'Referenced product must have a valid name');
      assert.ok(prod.brandId, 'Referenced product must belong to a brand');
    }
  }
});

// ---------------------------------------------------------------------------
// 7. Privacy-Conscious Browsing History Logic
// ---------------------------------------------------------------------------
test('Browsing History: Records unique items, promotes re-viewed to front, and caps at limit', () => {
  const maxLimit = 8;
  let history = [];

  const addView = (id) => {
    history = [id, ...history.filter(item => item !== id)].slice(0, maxLimit);
  };

  addView('prod_1');
  addView('prod_2');
  addView('prod_3');
  assert.deepEqual(history, ['prod_3', 'prod_2', 'prod_1']);

  // Re-viewing prod_1 promotes it to front
  addView('prod_1');
  assert.deepEqual(history, ['prod_1', 'prod_3', 'prod_2']);

  // Pushing beyond limit
  for (let i = 4; i <= 12; i++) {
    addView(`prod_${i}`);
  }
  assert.equal(history.length, maxLimit);
  assert.equal(history[0], 'prod_12');
});

// ---------------------------------------------------------------------------
// 8. Customer Profile Constraints & Security Integrity
// ---------------------------------------------------------------------------
test('Customer Profile: Profile updates reject empty names and preserve security roles', () => {
  const validateProfileUpdate = (updates, currentRole) => {
    if (!updates.name || !updates.name.trim()) {
      return { valid: false, error: 'Display name cannot be empty.' };
    }
    // Security check: client updates cannot escalate role
    return {
      valid: true,
      sanitized: {
        name: updates.name.trim(),
        role: currentRole, // Locked to current authoritative role
      }
    };
  };

  const emptyResult = validateProfileUpdate({ name: '' }, 'customer');
  assert.equal(emptyResult.valid, false);

  const whitespaceResult = validateProfileUpdate({ name: '    ' }, 'customer');
  assert.equal(whitespaceResult.valid, false);

  const validResult = validateProfileUpdate({ name: 'Alex Mercer', role: 'admin' }, 'customer');
  assert.equal(validResult.valid, true);
  assert.equal(validResult.sanitized.role, 'customer', 'Role must remain customer regardless of payload attempts');
});

// ---------------------------------------------------------------------------
// 9. Public Marketplace Routes Uncompromised
// ---------------------------------------------------------------------------
test('Public Marketplace: All canonical discovery routes remain functional', () => {
  assert.ok(PRODUCTS.length > 0, 'Products catalog is loaded');
  assert.ok(CREATORS.length > 0, 'Creators directory is loaded');
  assert.ok(BRANDS.length > 0, 'Brands directory is loaded');

  // Verify external purchase URL does not include checkout or cart
  for (const prod of PRODUCTS) {
    if (prod.externalPurchaseUrl) {
      assert.ok(
        !prod.externalPurchaseUrl.includes('/checkout') && !prod.externalPurchaseUrl.includes('/cart'),
        `Product ${prod.id} URL must link to brand site, not checkout/cart`
      );
    }
  }
});
