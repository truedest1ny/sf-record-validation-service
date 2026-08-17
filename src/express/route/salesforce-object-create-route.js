export function setObjectCreateRoute(router, handler){
    router.post('/payments/create',
        async (req, res, next) => {
            try {
                await handler(req, res);
            } catch (error) {
                next(error)
            }
        }
    );  
}