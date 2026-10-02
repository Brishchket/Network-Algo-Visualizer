export const serializeUser = (user) => {
    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;
    
    // hasPassword is true if password hash exists and is not empty
    const hasPassword = !!user.password && user.password.length > 0;
    
    const needsProfileSetup = !hasPassword;
    
    const authProviders = [];
    if (hasPassword) authProviders.push("password");
    if (user.googleId) authProviders.push("google");
    
    // Extra safety, delete password, refreshToken, __v if they somehow bypassed toJSON
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.googleId;
    delete userObj.__v;

    return {
        ...userObj,
        hasPassword,
        needsProfileSetup,
        authProviders
    };
};
