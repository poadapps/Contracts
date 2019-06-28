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
                    value = value.toString();
                    var retVal = web3.utils.toWei(value,'ether');
                    return retVal;
                }catch(ex){
                    return "0";
                }
            },
            cutDigits(value,numberOfDigits) {
                try{
                    if(value.indexOf(".")!=-1){
                        if(numberOfDigits===0){
                            value = value.toString();
                            return value.substr(0,value.indexOf("."));
                        }else{
                            return value.substr(0,value.indexOf(".")+numberOfDigits+1);
                        }
                    }
                    else{
                        return value;
                    }
                    var retVal = web3.utils.toWei(value,'ether');
                    return retVal;
                }catch(ex){
                    return "0";
                }
            },
            fromWei(value){
                try{
                    value = value.toString();
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