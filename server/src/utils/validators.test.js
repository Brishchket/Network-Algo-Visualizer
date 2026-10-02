import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeUsername,
  slugifyUsername,
  validatePassword,
  validateUsername,
} from "./validators.js";

describe("username validation", () => {
  it("normalizes usernames and accepts valid values", () => {
    assert.equal(normalizeUsername("  Valid_User "), "valid_user");
    assert.deepEqual(validateUsername("valid_user"), { valid: true });
  });

  it("rejects short, long, malformed, and reserved usernames", () => {
    for (const username of ["a", "a".repeat(21), "invalid user", "admin"]) {
      assert.equal(validateUsername(username).valid, false, username);
    }
  });
});

describe("password validation", () => {
  it("requires a letter, a number, and 8-72 UTF-8 bytes", () => {
    assert.equal(validatePassword("ValidPass1").valid, true);
    assert.equal(validatePassword("short1").valid, false);
    assert.equal(validatePassword("lettersOnly").valid, false);
    assert.equal(validatePassword("1234567890").valid, false);
    assert.equal(validatePassword("a".repeat(73) + "1").valid, false);
  });
});

describe("username slug generation", () => {
  it("slugifies display names, falls back to email, and caps the base", () => {
    assert.equal(slugifyUsername("John Doe", "john@example.com"), "john_doe");
    assert.equal(slugifyUsername("John!@#Doe", ""), "john_doe");
    assert.equal(slugifyUsername("", "Jane.Doe@example.com"), "jane_doe");
    assert.equal(slugifyUsername("a", ""), "a00");
    assert.equal(
      slugifyUsername("very long name that exceeds fifteen characters", ""),
      "very_long_name"
    );
  });
});