class ExpressError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
        }
        }
        module.exports = ExpressError;

//Express errors are another kind of error that can be thrown by Express. They are used to handle errors that occur during the execution