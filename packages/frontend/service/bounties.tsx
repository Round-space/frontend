import { Moralis } from 'moralis'

export const fetchBountiesByCreator = async (creator : string | null ,page : number | null, dashboard: boolean )=>{
    const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    Moralis.start({appId, serverUrl});

    if(!page){
        page = 1;
    }
    const params = {...(creator ? {creator} : {}), page, pageSize: 12, ...(dashboard ? {dashboard} : {})};
    const result = await Moralis.Cloud.run("getAllBounties", params);
    
    return {
        result
    }
}

export const fetchAllBountiesByCreator = async (creator : string | null, dashboard: boolean)=>{
    const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    Moralis.start({appId, serverUrl});

    const params = {...(creator ? {creator} : {}), ...(dashboard ? {dashboard} : {})};
    const result = await Moralis.Cloud.run("getAllUserBounties", params);
    
    return {
        result
    }
}

export const fetchBountyMetadataByaccount = async (account : string | null  )=>{
    const applicationId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    const bountyDataUrl = `${serverUrl}/functions/getAccountMetadata`;    
    return await (await fetch(bountyDataUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account,
            _ApplicationId: applicationId,
        }),
    })).json();

    // const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    // const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    // Moralis.start({appId, serverUrl});

    // const params = {...(account ? {account} : {})};
    // const result = await Moralis.Cloud.run("getAccountMetadata", params);
    
    // return {
    //     result: result.map(res => res.toJSON())
    // }
}

export const fetchBountiesCountByCreator = async ( creator : string | null, dashboard: boolean )=>{

    const applicationId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

    // const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    // const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    // Moralis.start({appId, serverUrl});
    
    const bountiesCountUrl = `${serverUrl}/functions/getUserBountiesCount?ApplicationId=${applicationId}&dashboard=${dashboard}`+ (creator ? `&creator=${creator}` : ``);    
    return await fetch(bountiesCountUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dashboard,
            _ApplicationId: applicationId,
        }),
    }).then(res => res.json())
    
    // const params = {...(creator ? {creator} : {}), dashboard};
    // const result = await Moralis.Cloud.run("getUserBountiesCount", params);
    
    // return {
    //     result
    // }
}