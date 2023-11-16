


export function getDiscordData(value :string){
  
  const lines = value?.split('\n');
  const baseUrl = 'https://discord.com/channels/';
  let supportsDiscord = false;
  let serverId = '';
  let channelId = '';
  for(let i = 0 ; i < lines?.length ; i++){
        const line = lines[i];
        if(line.startsWith(baseUrl)){
            const elements = line.substring(baseUrl.length).split('/');
            if(elements.length > 1){
                supportsDiscord = true;
                serverId = elements[0];
                channelId = elements[1];
                break;
            }    
        }
  }


  return { serverId : serverId , channelId : channelId, supportsDiscord: supportsDiscord}; 
}