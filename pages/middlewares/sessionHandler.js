import Cors from "cors";

const cors = Cors({
  methods: ["GET", "POST", "PUT", "HEAD", "PATCH", "DELETE"],
});

function sessionMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      console.log("resultlog", result);
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const sessionHandler = (handler) => {
  return async (req, res) => {
    var token;
    // if (req.headers.cookie) {

    //   req.headers.cookie = "next-auth.session-token=" + token;
    // }
    token = req.headers.authorization;
    console.log("tokenlock", token);
    req.headers.cookie = "next-auth.session-token=" + token;
    await sessionMiddleware(req, res, cors);
    return handler(req, res);
  };
};

export default sessionHandler;
