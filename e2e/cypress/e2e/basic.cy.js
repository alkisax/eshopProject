describe('E-Shop Basic E2E', () => {
  it('visits home page, navigates to minor footer pages', () => {
    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // Accept GDPR if shown
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });

    // Go to minor footer pages
    cy.contains('Πολιτική Απορρήτου').click();
    cy.url().should('include', '/privacy-policy');
    cy.contains('Ποια δεδομένα συλλέγουμε').should('be.visible');
    cy.contains('Τρόποι Πληρωμής').click();
    cy.url().should('include', '/payment-methods');
    cy.contains('Πληρωμή με Κάρτα Online').should('be.visible');
    cy.contains('Τρόποι Αποστολής').click();
    cy.url().should('include', '/shipping-methods');
    cy.contains('Χρεώσεις Αποστολής').should('be.visible');
    cy.contains('Όροι Χρήσης').click();
    cy.url().should('include', '/terms');
    cy.contains('Εφαρμοστέοι Νόμοι').should('be.visible');
    cy.contains('Πολιτική Επιστροφών').click();
    cy.url().should('include', '/return-policy');
    cy.contains('Έχετε το δικαίωμα να επιστρέψετε προϊόντα εντός 14 ημερολογιακών ημερών').should('be.visible');
    cy.contains('Πολιτική Cookies').click();
    cy.url().should('include', '/cookie-policy');
    cy.contains('Cookies Λειτουργικότητας').should('be.visible');
    cy.contains('Επικοινωνία').click();
    cy.url().should('include', '/contact');
    cy.contains('Βυζαντίου 40, Κάτω Πατήσια, Αθήνα 11144').should('be.visible');
    // ✅ Check iframe exists and has correct src
    cy.get('iframe')
      .should('exist')
      .and('have.attr', 'src')
      .and('include', 'https://www.google.com/maps/embed');
    cy.get('#navbar-home').click();
    cy.url().should('eq', 'http://localhost:5173/');

    // ✅ Put cy.log at the end of the test
    cy.log("✅ Finished test");
  });
});

describe('E-Shop Home Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // Accept GDPR if banner shows
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });
  });

  it('shows login button in navbar', () => {
    cy.get('#navbar-login').should('exist').and('be.visible');
  });

  it('shows commodities carousel', () => {
    cy.get('#home-carousel').should('exist').and('be.visible');
    cy.get('#home-carousel img').should('have.length.greaterThan', 0);
  });

  it('shows last announcement', () => {
    cy.get('#last-announcement').should('exist').and('be.visible');
    cy.get('#last-announcement h6').invoke('text').should('not.be.empty');
  });

  it ('has store/news/announcements btns working (store later)', () => {
    cy.get('#store-btn').should('exist').and('be.visible');
    cy.get('#news-btn').should('exist').and('be.visible').click();
    cy.url().should('include', '/news');
    cy.get('#navbar-home').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('#announcements-btn').should('exist').and('be.visible').click();
    cy.url().should('include', '/announcements');
    cy.get('#navbar-home').click();
    cy.url().should('eq', 'http://localhost:5173/');
  });
});

describe('Guest route', () => {
  beforeEach(() => {
    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // Accept GDPR if banner shows
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });
  });

  it('filters commodities by category (bauhause)', () => {
    cy.get('#store-btn').click();
    cy.url().should('include', '/store');

    // Assert list has items
    // Find all <img> elements inside the element with id="commodity-list"
    cy.get('#commodity-list img[alt]').its('length').should('be.greaterThan', 0);

    // Assert sidebar visible
    cy.get('#sidebar-title').should('contain.text', 'Categories');

    // Check Bauhaus checkbox
    // .check() means: mark this checkbox as checked
    cy.get('#cat-Bauhaus input[type="checkbox"]').check();

    // Assert that at least one Bauhaus item appears
    // img[alt="Bauhaus"] → exactly equals "Bauhaus". img[alt*="Bauhaus"] → alt contains the word "Bauhaus" anywhere.
    cy.get('#commodity-list img[alt*="Bauhaus"]').should('have.length.greaterThan', 0);

    // Assert that every item has Bauhaus in its name
    // i→insensitive
    cy.get('#commodity-list img[alt]').should('have.attr', 'alt').and('match', /bauhaus/i);

    cy.get ('#clear-filters-btn').click()
  });

  it('filters commodities using normal search', () => {
    cy.get('#store-btn').click();
    cy.url().should('include', '/store');

    // Type into normal search
    cy.get('#normal-search').type('bauhaus');

    // Assert that only commodities with 'bauhause' in alt text remain
    cy.get('#commodity-list img[alt]').each($img => {
      cy.wrap($img)
        .should('have.attr', 'alt')
        .and('match', /bauhaus/i);
    });
  });

  it('should add to cart, view item (Δαχτυλίδι mandala) and do buy', () => {

    // ✅ Hook BEFORE the app loads, so we can stub redirect safely
    cy.on('window:before:load', (win) => {
      cy.stub(win.location, 'assign').as('locationAssign');
    });

    cy.get('#store-btn').click();
    cy.url().should('include', '/store');

    cy.get('#normal-search').type('Δαχτυλίδι mandala');
    cy.get('#commodity-list').should('contain.text', 'Δαχτυλίδι mandala');
    cy.get('#commodity-list #add-one-list-item-btn').first().click();

    // ✅ Wait up to 10s for footer to appear and contain text
    cy.get('#navbar-cart-badge', { timeout: 10000 }).should('exist');

    // a → means “all <a> tags”
    cy.get('#commodity-list a').first().click();
    // literally /commodity/ + 24 characters, each one being a hexadecimal digit
    cy.url().should('match', /\/commodity\/[a-f0-9]{24}$/);

    cy.get('#navbar-cart-badge').click();
    cy.url().should('include', '/cart');

    cy.get('#proceed-to-shipping-btn').click();
    cy.url().should('include', '/shipping-info');

    cy.get('#shipping-email').type('test@example.com');
    cy.get('#shipping-full-name').type('Test User');
    cy.get('#shipping-address-line-1').type('123 Main St');
    cy.get('#shipping-city').type('Athens');
    cy.get('#shipping-postal-code').type('11144');
    cy.get('#shipping-country').type('Greece');
    cy.get('#shipping-phone').type('6900000000');
    cy.get('#shipping-notes').type('Leave at the door');

    // Choose pickup option
    cy.get('#shipping-pickup-option input[type="radio"]').check();

    // Submit form → this normally calls handleCheckout → POST /api/transaction → Stripe redirect
    // cy.get('form').submit();

    // TODO if submit leaves cypress and enters stripe and test stops
  });

});

describe('login test', () => {
  beforeEach(() => {
    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // Accept GDPR if banner shows
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });
  });

  it('signs up user via Appwrite', () => {
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').click();
    cy.url().should('include', '/login');

    cy.get('#tab-appwrite-login').click();
    cy.get('#appwrite-register-link').click();
    cy.url().should('include', '/register-appwrite');

    cy.get('#appwrite-singup-username').type('cypressUser1');
    cy.get('#appwrite-singup-fullname').type('Cypress Test User');
    cy.get('#appwrite-singup-email').type('cypressUser@example.com');
    cy.get('#appwrite-singup-password').type('Password123!');
    cy.get('#appwrite-singup-confirm-password').type('Password123!');

    // ✅ Catch success alert
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain('Account Created Successfully 🚀');
    });

    cy.get('#appwrite-singup-submit-btn').click();

    // ✅ Just assert redirect to home
    cy.url({ timeout: 20000 }).should('eq', 'http://localhost:5173/');
  });

  it('logs in with existing Appwrite user', () => {
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').click();
    cy.url().should('include', '/login');

    cy.get('#tab-appwrite-login').click();

    cy.get('#appwrite-login-field-email').type('cypressUser@example.com');
    cy.get('#appwrite-login-field-password').type('Password123!');

    cy.get('#appwrite-login-btn').click();

    // ✅ Instead of waiting for Mongo profile, just assert we’re back home
    cy.url({ timeout: 20000 }).should('eq', 'http://localhost:5173/');

    // ✅ Make sure user is logged in already
    cy.url({ timeout: 20000 }).should('include', 'http://localhost:5173/');

    // ✅ Go to profile
    cy.get('#navbar-profile-btn', { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .click();

    cy.url().should('include', '/profile');
    // cy.contains('Update user info').should('be.visible');

    // ✅ Open delete dialog
    cy.contains('Delete My Account').click();

    // ✅ Confirm deletion
    cy.contains('Yes, Delete').click();

    // ✅ Catch and verify alert
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain('Your account has been deleted.');
    });

    // ✅ After deletion, should redirect to home
    cy.url({ timeout: 20000 }).should('eq', 'http://localhost:5173/');

    // ✅ Assert that login button shows again (user is logged out)
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').and('be.visible');
  });
});

describe('Backend auth tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // ✅ Accept GDPR banner if present
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });
  });

  it('should register a new backend user', () => {
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').click();
    cy.url().should('include', '/login');

    // ✅ Switch to backend login tab
    cy.get('#tab-backend-login').click();

    // ✅ Go to register link
    cy.get('#backend-form-register-link').click();
    cy.url().should('include', '/register-backend');

    // ✅ Fill out form
    cy.get('#backend-form-username').type('cypressBackendUser');
    cy.get('#backend-form-fullname').type('Cypress Backend Tester');
    cy.get('#backend-form-email').type('cypressBackend@example.com');
    cy.get('#backend-form-password').type('Password123!');
    cy.get('#backend-form-confirm-password').type('Password123!');

    // ✅ Submit
    cy.get('#backend-form-submit-btn').click();

    // ✅ Expect success alert
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain('Account created'); // adjust exact wording from your backend response
    });

    // ✅ Redirects to home
    cy.url({ timeout: 20000 }).should('eq', 'http://localhost:5173/');
  });

  it('should login with backend user', () => {
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').click();
    cy.url().should('include', '/login');

    // ✅ Switch to backend login tab
    cy.get('#tab-backend-login').click();

    // ✅ Fill login form
    cy.get('#backend-login-username').type('cypressBackendUser');
    cy.get('#backend-login-password').type('Password123!');

    // ✅ Submit login
    cy.get('#backend-form-submit-btn').click();

    // ✅ After login, check profile button exists
    cy.get('#navbar-profile-btn', { timeout: 20000 })
      .should('exist')
      .and('be.visible');
  });

  it('should navigate commodity, add/remove favorites, and proceed to shipping', () => {
    
    cy.intercept('POST', '/api/users/*/favorites').as('addFavorite');
    cy.intercept('DELETE', '/api/users/*/favorites').as('removeFavorite');
    cy.intercept('GET', '/api/users/*').as('getUser');
    cy.intercept('GET', '/api/commodity/*').as('getCommodity');
    
    // ✅ login first
    cy.get('#navbar-login', { timeout: 10000 }).should('exist').click();
    cy.url().should('include', '/login');

    cy.get('#tab-backend-login').click();
    cy.get('#backend-login-username').type('cypressBackendUser');
    cy.get('#backend-login-password').type('Password123!');
    cy.get('#backend-form-submit-btn').click();

    // ✅ profile btn confirms logged in
    cy.get('#navbar-profile-btn', { timeout: 20000 })
      .should('exist')
      .and('be.visible');

    // Go to store
    cy.get('#store-btn').click();
    cy.url().should('include', '/store');

    // Click first commodity link
    cy.get('#commodity-list a').first().click();

    // Assert URL is /commodity/:id
    cy.url().should('match', /\/commodity\/[a-f0-9]{24}$/);

    // Assert title and price
    cy.get('h4').should('exist').and('not.be.empty');       // title
    cy.get('#item-price').should('exist').and('contain', '€'); // price format

    // Assert description + stock
    cy.get('#item-descrition').should('exist');
    cy.get('#item-stock').should('exist');

    // Assert Add to Cart button works
    cy.get('#item-add-to-cart-btn')
      .should('exist')
      .and('not.be.disabled')
      .click();

    // ✅ Add to Favorites
    cy.get('#item-favorites').should('exist').click();
    cy.wait('@addFavorite').its('response.statusCode').should('eq', 200);

    cy.wait('@getUser');
    cy.wait('@getCommodity');

    // Go to favorites page
    cy.get('#navbar-favorites-icon').click();
    cy.url().should('include', '/favorites');

    // ✅ Go back home via profile btn (or replace with your home btn id)
    cy.get('#navbar-home').click();
    cy.url().should('eq', 'http://localhost:5173/');

    // ✅ Continue to store again
    cy.get('#store-btn').click();
    cy.url().should('include', '/store');

    // Search and add item
    cy.get('#normal-search').type('Δαχτυλίδι mandala');
    cy.get('#commodity-list').should('contain.text', 'Δαχτυλίδι mandala');
    cy.get('#commodity-list #add-one-list-item-btn').first().click();

    // ✅ Wait for cart badge to show
    cy.get('#navbar-cart-badge', { timeout: 10000 }).should('exist');

    // Go into commodity details
    cy.get('#commodity-list a').first().click();
    cy.url().should('match', /\/commodity\/[a-f0-9]{24}$/);

    // ✅ Open cart
    cy.get('#navbar-cart-badge').click();
    cy.url().should('include', '/cart');

    // ✅ Proceed to shipping
    cy.get('#proceed-to-shipping-btn').click();
    cy.url().should('include', '/shipping-info');

    // ✅ Fill shipping form
    cy.get('#shipping-email').type('test@example.com');
    cy.get('#shipping-full-name').type('Test User');
    cy.get('#shipping-address-line-1').type('123 Main St');
    cy.get('#shipping-city').type('Athens');
    cy.get('#shipping-postal-code').type('11144');
    cy.get('#shipping-country').type('Greece');
    cy.get('#shipping-phone').type('6900000000');
    cy.get('#shipping-notes').type('Leave at the door');

    // ✅ Choose pickup option
    cy.get('#shipping-pickup-option input[type="radio"]').check();

    // Don’t submit because Stripe redirect will break Cypress
    // cy.get('form').submit();
  });
});

describe('Admin login and panel access', () => {

  it('logs in as admin and sees Admin Panel button', () => {

    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // Accept GDPR if needed
    cy.get("body").then($body => {
      if ($body.find("button:contains('Accept')").length > 0) {
        cy.contains("Accept").click();
      }
    });

    cy.get('#navbar-login').click();
    cy.get('#tab-backend-login').click();

    cy.get('#backend-login-username').type('alkisax');
    cy.get('#backend-login-password').type('AdminPass1!');
    cy.get('#backend-form-submit-btn').click();

    // ✅ Admin button visible
    cy.get('#navbar-admin-btn', { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .click();

    cy.url().should('include', '/admin-panel');
  });

  it('logs in as admin and browses admin panel', () => {
    cy.viewport(1280, 900); // ensure lg columns (e.g., Status) can appear

    cy.clearLocalStorage("ga_consent");
    cy.visit('/');

    // GDPR
    cy.get('body').then($b => {
      if ($b.find("button:contains('Accept')").length > 0) cy.contains('Accept').click();
    });

    // Login (backend)
    cy.get('#navbar-login').click();
    cy.get('#tab-backend-login').click();
    cy.get('#backend-login-username').type('alkisax');
    cy.get('#backend-login-password').type('AdminPass1!');
    cy.get('#backend-form-submit-btn').click();

    // Admin Panel
    cy.get('#navbar-admin-btn', { timeout: 20000 }).should('be.visible').click();
    cy.url().should('include', '/admin-panel');

    // Commodities
    cy.get('#admin-sidebar-commodities').click();
    cy.contains('Name').should('be.visible');
    cy.contains('Price').should('be.visible');
    cy.contains('Stock').should('be.visible');

    // Categories
    cy.get('#admin-sidebar-categories').click();
    cy.contains('Add Category').should('be.visible')

    // Participants
    cy.get('#admin-sidebar-participants').click();
    cy.contains('Email').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Surname').should('be.visible');

    // Transactions
    cy.get('#admin-sidebar-transactions').click();
    cy.contains('Amount').should('be.visible');
    // "Status" may be hidden on < lg; viewport set above should help,
    // but if still flaky, comment the next line:
    cy.contains('Status').should('exist');

    // Posts
    cy.get('#admin-sidebar-posts').click();
    cy.contains('All Posts').should('be.visible');
    cy.contains('Title').should('be.visible');
    cy.contains('SubPage').should('be.visible');

    // Blog Editor (EditorJS may or may not initialize instantly)
    cy.get('#admin-sidebar-create-posts').click();
    cy.get('body').then($b => {
      if ($b.find('.codex-editor').length > 0) {
        cy.get('.codex-editor').should('be.visible');
      } else {
        // Fallback: assert generic editor heading commonly rendered
        cy.contains(/Dashboard|Title/i).should('be.visible');
      }
    });

    // Comments
    cy.get('#admin-sidebar-comments').click();
    cy.contains('All Comments').should('be.visible');
    cy.contains('Email').should('be.visible');
    cy.contains('Text').should('be.visible');

    // Local Uploads
    cy.get('#admin-sidebar-local-uploads').click();
    cy.get('input[type="file"]').should('exist');

    // Cloud Uploads
    cy.get('#admin-sidebar-cloud-uploads').click();
    cy.contains('Cloud Uploads').should('be.visible'); // "Cloud Uploads (Appwrite)" in file
    cy.get('input[type="file"]').should('exist');

    // Analytics (Looker Studio iframe)
    cy.get('#admin-sidebar-analytics').click();
    cy.contains('Google Analytics').should('be.visible');
    cy.get('iframe[src*="lookerstudio.google.com"]').should('exist');

    // Clear Old
    cy.get('#admin-sidebar-clear-old').click();
    cy.contains('Clear Old Transactions').should('be.visible');
    cy.contains('Clear All').should('be.visible');
  });
});

