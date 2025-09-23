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

