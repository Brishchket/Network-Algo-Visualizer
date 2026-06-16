
// This asyncHandler is a wrapper function used in Express.js to handle errors from async route handlers automatically.

// The main problem it solves:

// Normally, if an async route throws an error, Express does not catch it automatically. You would have to write try/catch in every route.


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
}
export { asyncHandler }