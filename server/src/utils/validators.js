export const normalizeUsername = (username) => {
    if(!username) return "";
    return username.trim().toLowerCase();
};

export const validateUsername = (username) => {
    const reserved = new Set(["admin", "root", "api", "me", "support", "system", "null", "undefined"]);
    if (!username) return { valid: false, reason: "Username is required" };
    if (username.length < 3 || username.length > 20) return { valid: false, reason: "Username must be 3-20 characters" };
    if (!/^[a-z0-9_]+$/.test(username)) return { valid: false, reason: "Username can only contain letters, numbers, and underscores" };
    if (reserved.has(username)) return { valid: false, reason: "Username is reserved" };
    return { valid: true };
};

export const validatePassword = (password) => {
    if (!password) return { valid: false, reason: "Password is required" };
    const byteLength = Buffer.byteLength(password, 'utf8');
    if (byteLength < 8 || byteLength > 72) return { valid: false, reason: "Password must be 8-72 bytes" };
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return { valid: false, reason: "Password must contain at least one letter and one number" };
    return { valid: true };
};

export const slugifyUsername = (displayName, email) => {
    let base = displayName || "";
    base = base.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    if (!base) {
        base = email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") : "user";
    }
    if (base.length < 3) base = base.padEnd(3, "0");
    if (base.length > 15) base = base.substring(0, 15).replace(/_$/, "");
    return base;
};
