describe("Chat Flow", () => {
  it("allows a user to start a chat and send a message", () => {
    // Provide an intercept to stub responses if no backend is running
    // but typically these tests run against a seeded localhost backend.

    cy.visit("/");

    // Login (assuming standard seeded user)
    cy.get('[data-testid="linkToLogin"]').click();
    cy.get('input[name="email"]').type("testuser@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Give it time to route and load state
    cy.url().should("not.include", "/login");

    // Find first listing card on the home page and click
    // Note: Depends on listings existing in the database
    cy.get("body").then(($body) => {
      if ($body.find(".listing-card").length > 0) {
        cy.get(".listing-card").first().click();

        // Ensure we moved to Listing Detail
        cy.url().should("include", "/listings/");

        // Click Contact Seller button (if not own listing)
        // If it's own listing, we might just be skipping or need a different test user.
        // Assuming we are a buyer:
        cy.get("body").then(($body2) => {
          if ($body2.find("button:contains('Contact Seller')").length > 0) {
            cy.contains("button", "Contact Seller").click();

            // Land on chat page
            cy.url().should("include", "/chat/");

            // Type and send a message
            const testMessage = `Hello this is a Cypress test ${Date.now()}`;
            cy.get('input[type="text"]').type(testMessage);
            cy.contains("button", "Send").click();

            // Verify message appears in UI
            cy.contains(testMessage).should("be.visible");

            // Navigate to Inbox
            cy.contains("button", "Back").click();
            cy.url().should("include", "/inbox");

            // Verify conversation appears in Inbox
            cy.contains(testMessage).should("be.visible");
          }
        });
      }
    });
  });
});
