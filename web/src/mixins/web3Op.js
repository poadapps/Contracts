const myMixin = function(web3){

    return {
        data() {
            return {
                isLoaded:false
            };
        },
        methods: {
            toWei(value) {
                try{
                    var retVal = web3.utils.toWei(value,'ether');
                    return retVal;
                }catch(ex){
                    return "0";
                }
            },
            fromWei(value){
                try{
                    return web3.utils.fromWei(value,'ether');
                }catch(ex){
                    return 0;
                }
            }
        }
    };
}

export default myMixin;