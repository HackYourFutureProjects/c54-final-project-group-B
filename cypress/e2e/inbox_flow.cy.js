describe("Inbox Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
    // Standard test user login
    cy.get('input[name="email"]').type("testuser@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Verify login success before proceeding
    cy.url().should("not.include", "/login");
  });

  it("loads the inbox and displays active conversations, allowing archive", () => {
    // Visit inbox
    cy.visit("/inbox");
    cy.url().should("include", "/inbox");

    // Wait for history to load
    cy.contains("Inbox", { timeout: 10000 }).should("be.visible");

    cy.get("body").then(($body) => {
      // Check if there are any active conversations
      const conversations = $body.find(".conversation-item");
      if (conversations.length > 0) {
        // Find an archive button and click it to test moving to archive tab
        cy.wrap(conversations.first()).within(() => {
          cy.contains("button", "Archive").click();
        });

        // Switch to Archived tab
        cy.contains("button", "Archived").click();

        // Verify there is at least one archived conversation
        cy.get(".conversation-item").should("have.length.at.least", 1);

        // Switch back to active to verify UX flow
        cy.contains("button", "Active").click();
      } else {
        // Base case: empty inbox assert
        cy.contains("No active conversations").should("be.visible");
      }
    });
  });
});
