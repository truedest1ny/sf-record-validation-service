export function setObjectCreateRoute(router, handler){
    router.post('/payments/create',
        (req, res) => {
            handler(req, res);
        });
}