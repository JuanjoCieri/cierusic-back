function setHeaders(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://cierusic.vercel.app"); 
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, token, session"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE, PATCH"
    );
    next();
  }
  
  export default setHeaders