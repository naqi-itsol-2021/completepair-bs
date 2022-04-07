import Cors from 'cors';

const cors = Cors({
    methods:['GET','POST','PUT','HEAD','PATCH','DELETE'],
})

function sessionMiddleware(req,res,fn){
    return new Promise((resolve,reject) => {
        fn(req,res,(result) => {
            if(result instanceof Error){
                return reject(result)
            }
            return resolve(result);
        })
    })
}

const sessionHandler = (handler) => {
    return async (req,res) => {
        const token = req.headers.authorization; 
        req.headers.cookie = 'next-auth.session-token=' + token;
        await sessionMiddleware(req,res,cors);
        return handler(req,res);
    }

}

export default sessionHandler;