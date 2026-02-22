describe("Buyer Experience - Proximity Features", () => {
  beforeEach(() => {
    cy.seedDatabase();
    // Visit a verified listing
    cy.visit("/listings");
    cy.get(".listing-card").first().click();
  });

  it("should show dual pins and calculate distance", () => {
    // Mock Geolocation
    const mockCoords = {
      latitude: 52.52,
      longitude: 13.405,
    };

    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake((cb) => {
        return cb({ coords: mockCoords });
      });
    });

    // Initial state: No distance badge
    cy.get(".distance-badge").should("not.exist");
    cy.get(".user-location-marker").should("not.exist");

    // Click "Check Distance"
    cy.intercept("GET", "https://{s}.tile.openstreetmap.org/**").as("tileRequest");
    cy.get(".btn-map-primary").contains("Check Distance").click();

    // Verify distance badge appears
    cy.get(".distance-badge", { timeout: 10000 }).should("be.visible");
    cy.contains("km from you").should("be.visible");

    // Verify User Pin (Blue dot) appears
    cy.get(".user-location-marker").should("exist");

    // Verify Reset button appears
    cy.get(".btn-map-action").contains("Reset to Bike").should("be.visible");
  });
});
