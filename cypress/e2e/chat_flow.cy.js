describe("Chat and Inbox Flow", () => {
  beforeEach(() => {
    cy.seedDatabase();
  });

  it("should allow a buyer to send a message and a seller to reply", () => {
    // 1. Login as Buyer Ben
    cy.visit("/login");
    cy.get('input[type="email"]').clear().type("buyer@test.com");
    cy.get('input[type="password"]').clear().type("Password123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");

    // 2. Visit a listing
    cy.contains("Vintage Gazelle Bike").click();
    cy.url().should("include", "/listings/");

    // 3. Contact Seller
    cy.getByTestId("contact-seller-btn").should("be.visible").click();
    cy.url().should("include", "/chat/");

    // 4. Send a message
    const buyerMessage = "Hello Sam, I love this bike!";
    cy.getByTestId("chat-input").clear().type(buyerMessage);
    cy.getByTestId("chat-send-button").click();

    // Verify message appears in history
    cy.getByTestId("message-text").contains(buyerMessage).should("be.visible");

    // 5. Logout
    cy.get(".nav-profile-dropdown-trigger").click();
    cy.contains("Logout").click();
    cy.url().should("not.include", "/chat");

    // 6. Login as Seller Sam
    cy.visit("/login");
    cy.get('input[type="email"]').clear().type("seller@test.com");
    cy.get('input[type="password"]').clear().type("Password123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");

    // 7. Go to Inbox
    cy.visit("/inbox");
    cy.getByTestId("inbox-list").should("be.visible");
    cy.getByTestId("inbox-card").first().click();

    // 8. Verify message received and reply
    cy.getByTestId("message-text").contains(buyerMessage).should("be.visible");

    const sellerReply = "Thanks Ben! It is a great bike indeed.";
    cy.getByTestId("chat-input").clear().type(sellerReply);
    cy.getByTestId("chat-send-button").click();

    // Verify reply appears
    cy.getByTestId("message-text").contains(sellerReply).should("be.visible");
  });

  it("should navigate between Active and Archived tabs in Inbox", () => {
    // Login as Seller Sam
    cy.visit("/login");
    cy.get('input[type="email"]').clear().type("seller@test.com");
    cy.get('input[type="password"]').clear().type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.visit("/inbox");
    cy.contains("Active").should("have.class", "activeTab");
    cy.contains("Archived").click();
    cy.contains("Archived").should("have.class", "activeTab");
    cy.contains("No archived conversations").should("be.visible");
  });
});
