import boardGraphic from '../../../utils/boardGraphic';

async function requestGraphicsHandler(req, res) {
    
    const logoUrl= req.query.logo ?  req.query.logo : null;
    const active= req.query.active ?  req.query.active : 0;
    const name = req.query.name ?  req.query.name : '-';
    
    await boardGraphic(name, active, logoUrl, res);

}

export default requestGraphicsHandler;