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
                    var value =  web3.utils.fromWei(value,'ether');
                    return value;
                }catch(ex){
                    return 0;
                }
            }
        }
    };
}

export default myMixin;