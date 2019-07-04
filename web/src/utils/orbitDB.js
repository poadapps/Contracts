
import EventBus from '../components/common/eventBus'
// /orbitdb/zdpuAvvrXhn78aATc4DZZ1vTupPcQ1XPLRHLCNKmrC6mXPyjh/my-tokens
// /orbitdb/zdpuAvvrXhn78aATc4DZZ1vTupPcQ1XPLRHLCNKmrC6mXPyjh/my-tokens
(function(){

    const ipfsOptions = {
        EXPERIMENTAL: {
          pubsub: true
        }
      }

    const ipfs = new Ipfs(ipfsOptions)

    const dbConfig = {
        // If database doesn't exist, create it
        create: true,
        // Don't wait to load from the network
        sync: false,
        // Load only the local version of the database
        localOnly: true,
        // Allow anyone to write to the database,
        // otherwise only the creator of the database can write
        admin: ['*'],
        write: ['*'],
      }
      ipfs.on('ready',async () => {
        console.log('Ipfs works!')
        const orbitdb = await OrbitDB.createInstance(ipfs);
        orbitdb.feed('my-tokens',dbConfig).then((db)=>{
            console.log('OrbitDB works!', db.id)
            var writeContent = function(content){
                console.log('try to store data to OrbitDB=',content);
                return new Promise((res,rej)=>{
                    return db.add(content).then((x)=>{
                        console.log('data stored to OrbitDB, data=',content,' hash=',x);
                        res(x);
                    }).catch((err)=>{
                        res(err);
                    })
                });
            }
    
            var readContentByHash = function(hash){
                return new Promise((res,rej)=>{
                    if(hash.startsWith("0x")){
                        hash=hash.substr(2);
                    }
                    console.log('trying reading from OrbitDB, hash=',hash);
                    var events = db.get(hash);
                    var data = undefined;
                    if(events){
                    //    console.log('OrbitDB events not null',events);
                        data = events.payload.value;
                   //    console.log('data',data);
                    }
                    
                    res(data);
                });
            }

            EventBus.$on('saveContent',function(data){
                console.log('trying writing to OrbitDB, data=',data);
                writeContent(data.content).then((hash)=>{
                    console.log('Data written to OrbitDB, hash=',hash);
                    EventBus.$emit('contentSaved',{
                        hash:hash,
                        id:data.id
                    });
                })
            })

            EventBus.$on('loadContent',function(data){
                readContentByHash(data.hash).then((readedStuff)=>{
                    if(readedStuff){
                        console.log('stuff found ',readedStuff);
                    }else{
                        console.log('OrbitDB has no data');
                    }
                    EventBus.$emit('contentLoaded',{
                        id:data.id,
                        content:readedStuff
                    });
                }).catch((err)=>{

                    EventBus.$emit('contentLoadedError',err);
                })
            })
        })


  
      })
})()