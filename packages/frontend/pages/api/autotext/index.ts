const api_key = process.env.OPENAI_API_KEY;

async function autoText(req, res){

    const prompt = req.body.prompt;

    if(!prompt){
        res.status(400).json({error: "No prompt provided"});
        return;
    }
    
    const response = await fetch('https://api.openai.com/v1/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
          },
          body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: `Task: ${prompt}\n\nDetails:`,
            temperature: 0.5,
            max_tokens: 500
          })
        }
    ).then(response => response.json())

    res.status(200).json({choices: response?.choices ?? []});
}

export default autoText;

