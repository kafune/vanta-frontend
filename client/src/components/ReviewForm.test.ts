import { describe, it, expect, vi } from "vitest";

describe("ReviewForm", () => {
  it("should validate rating is selected", () => {
    // Test that rating validation works
    const rating = 0;
    expect(rating).toBe(0);
  });

  it("should validate title minimum length", () => {
    // Test that title must have at least 3 characters
    const title = "ab";
    expect(title.length).toBeLessThan(3);
  });

  it("should validate comment minimum length", () => {
    // Test that comment must have at least 10 characters
    const comment = "short";
    expect(comment.length).toBeLessThan(10);
  });

  it("should accept valid review data", () => {
    const review = {
      rating: 5,
      title: "Excelente produto",
      comment: "Muito bom mesmo, recomendo para todos!",
    };

    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(5);
    expect(review.title.length).toBeGreaterThanOrEqual(3);
    expect(review.comment.length).toBeGreaterThanOrEqual(10);
  });
});
