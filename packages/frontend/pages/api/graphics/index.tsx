import bountyGraphic from '../../../utils/bountyGraphic';

async function requestGraphicsHandler(req, res) {
    
    const name = req.query.name ?  req.query.name : '-';
    const amount = req.query.amount ?  req.query.amount : '-';
    const date = req.query.date ?  req.query.date : '-';
    const status = req.query.status ?  req.query.status : '-';
    await bountyGraphic(name, amount, date, status, res);

    // //respond as json
    // res.json({result});
    // header to be png
    // res.setHeader('Content-Type', 'image/png');
    // res.send(btoa(result));
    
}

export default requestGraphicsHandler;