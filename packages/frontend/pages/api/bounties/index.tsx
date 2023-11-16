import { fetchBountiesByCreator } from "../../../service/bounties";

async function requestBountiesHandler(req,res){
    const creatorId = req.query.creatorId ?  req.query.creatorId : null;
    const page =  req.query.page ?  req.query.page : 1;

    if(req.method === 'GET'){
        try{
            const data =fetchBountiesByCreator(creatorId,page, false);
            res.status(200).json(data);  

        }catch(err){
            res.status(500).json({message : `Cant get bounties`});

        }      
    }
}

export default requestBountiesHandler;

