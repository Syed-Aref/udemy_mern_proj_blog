const globalErrHandler = (err, req, res, next) => {
    const stack = err.stack;
    const messsage = err.message;
    const status = err.status ? err.status : "failed";
    const statusCode = err.statusCode ? err.statusCode : 500;
    //send response
    res.status(statusCode).json({
      messsage,
      statusCode, 
      status,
      stack,
    });
  };
  module.exports = globalErrHandler;