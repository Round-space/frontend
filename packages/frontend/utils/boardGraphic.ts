import * as PImage from 'pureimage';
import axios from 'axios';
import {PNG} from "pngjs";
import fs from 'fs';
import {Line} from "../../../node_modules/pureimage/src/line.js"
import {Point} from "../../../node_modules/pureimage/src/point.js"


let _fonts = {};

function findFont(family) {
    if(_fonts[family]) return _fonts[family];
    family =  Object.keys(_fonts)[0];
    return _fonts[family];
}

function measureText(ctx,text) {
    let font = findFont(ctx._font.family);
    if(!font) console.warn("WARNING. Can't find font family ", ctx._font);
    if(!font.font) console.warn("WARNING. Can't find font family ", ctx._font);
    
    const fsize = ctx._font.size
    const glyphs = font.font.stringToGlyphs(text)
    let advance = 0
    glyphs.forEach(function(g) { advance += g.advanceWidth; })

    return {
        width: advance/font.font.unitsPerEm*fsize,
        emHeightAscent: font.font.ascender/font.font.unitsPerEm*fsize,
        emHeightDescent: font.font.descender/font.font.unitsPerEm*fsize,
    }
}

function calcQuadraticAtT(p, t) {
    const x = (1 - t) * (1 - t) * p[0].x + 2 * (1 - t) * t * p[1].x + t * t * p[2].x
    const y = (1 - t) * (1 - t) * p[0].y + 2 * (1 - t) * t * p[1].y + t * t * p[2].y
    return new Point(x, y);
}

const PATH_COMMAND = {
    MOVE: 'm',
    LINE: 'l',
    QUADRATIC_CURVE: 'q',
    BEZIER_CURVE: 'b'
};

function flatness(curve) {
    const pointA = curve[0]
    const controlPointA = curve[1]
    const controlPointB = curve[2]
    const pointB = curve[3]
    let ux = Math.pow( 3 * controlPointA.x - 2 * pointA.x - pointB.x, 2 );
    let uy = Math.pow( 3 * controlPointA.y - 2 * pointA.y - pointB.y, 2 );
    let vx = Math.pow( 3 * controlPointB.x - 2 * pointB.x - pointA.x, 2 );
    let vy = Math.pow( 3 * controlPointB.y - 2 * pointB.y - pointA.y, 2 );
    if( ux < vx )
        ux = vx;
    if( uy < vy )
        uy = vy;
    return ux + uy;
}

function midpoint(p1,p2,t) {
    return { x: (p2.x-p1.x)*t+p1.x, y: (p2.y-p1.y)*t+p1.y}
}

function splitCurveAtT(p,t, debug) {
    let p1 = p[0]
    let p2 = p[1]
    let p3 = p[2]
    let p4 = p[3]

    let p12 = midpoint(p1,p2,t)
    let p23 = midpoint(p2,p3,t)
    let p34 = midpoint(p4,p3,t)


    let p123 = midpoint(p12,p23,t)
    let p234 = midpoint(p23, p34,t)
    let p1234 = { x: (p234.x-p123.x)*t+p123.x, y: (p234.y-p123.y)*t+p123.y}

    return [[p1, p12, p123, p1234],[p1234,p234,p34,p4]]
}

function bezierToLines(curve, THRESHOLD) {
    function recurse(curve) {
        if(flatness(curve) < THRESHOLD) return [curve[0],curve[3]]
        const split = splitCurveAtT(curve,0.5,false)
        return recurse(split[0]).concat(recurse(split[1]))
    }
    return recurse(curve)
}

function pathToShapes(path) {
    const shapes = [];
    let shapeIndex = 0;

    let lines = []
    
    let curr = null

    path.forEach(function(cmd) {
        if(cmd[0] === PATH_COMMAND.MOVE) {
            
            shapeIndex++;

            
            shapes[shapeIndex - 1] = [];
            

            curr = cmd[1];
        }
        if(cmd[0] === PATH_COMMAND.LINE) {
            const pt = cmd[1]
            shapes[shapeIndex - 1].push(new Line(curr, pt));
            curr = pt;
        }
        if(cmd[0] === PATH_COMMAND.QUADRATIC_CURVE) {
            const pts = [curr, cmd[1], cmd[2]];
            for(let t=0; t<1; t+=0.1) {
                let pt = calcQuadraticAtT(pts,t);
                shapes[shapeIndex - 1].push(new Line(curr, pt));
                curr = pt;
            }
        }
        if(cmd[0] === PATH_COMMAND.BEZIER_CURVE) {
            const pts = [curr, cmd[1], cmd[2], cmd[3]];
            bezierToLines(pts,10).forEach(pt => {
                shapes[shapeIndex - 1].push(new Line(curr,pt))
                curr = pt
            })
        }
    });
    return shapes;
}


const zfill = function (ctx) {
    if(!ctx._closed) ctx.closePath()
    const shapes = pathToShapes(ctx.path);    //.slice(132);
    const limits = [], deviations = [];
    
    const combinedShapes = [];
    
    shapes.forEach((shape, index) => {

        let minX = null, maxX = null, minY = null, maxY = null, totalX = null, totalY = null;
        // calculate surface area of the shape

        // find limits of the shape
        shape.forEach((line, lindex) => {
           
            if(minX === null) {
                minX = line.start.x;
                maxX = line.start.x;
                minY = line.start.y;
                maxY = line.start.y;
                totalX = line.start.x;
                totalY = line.start.y;
            }

            if(line.start.x < minX) minX = line.start.x;
            if(line.start.x > maxX) maxX = line.start.x;
            if(line.start.y < minY) minY = line.start.y;
            if(line.start.y > maxY) maxY = line.start.y;
            totalX += line.start.x;
            totalY += line.start.y;
        });

        // center point as per the limits
        const center = {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
        // center point as per the total
        const totalCenter = {
            x: totalX / shape.length,
            y: totalY / shape.length
        };

        // deviation from the center point
        deviations.push(Math.abs((center.x - totalCenter.x + center.y - totalCenter.y) / 2 / ctx._font.size));
        // console.log('deviation', index, deviations[index]);
        limits.push({
            minX,
            minY,
            maxX,
            maxY
        })

    })
    
    const ignore = [];

    // for each of the limits, find another limit that is contained within it, in any order
    limits.forEach((limit, index) => {
        if(ignore.includes(index)) return;
        
        let combinedShape = [...shapes[index]];
        // console.log('deviation', index, deviations[index]);
        if( deviations[index] < 0.16 || shapes.length === 2) {
            limits.forEach((otherLimit, otherIndex) => {
                
                if(shapes[otherIndex].length < 6) return;

                // if the height of the other limit is less than half the height of the limit, return
                // if(otherIndex != index + 1 && otherLimit.maxY - otherLimit.minY < (limit.maxY - limit.minY) / 2 ) return;

                if(otherIndex !== index && otherLimit.minX >= limit.minX && otherLimit.maxX <= limit.maxX && otherLimit.minY >= limit.minY && otherLimit.maxY <= limit.maxY) {
                    
                    ignore.push(otherIndex)
                    combinedShape = [...combinedShape, ...shapes[otherIndex]];
                }
            })
        }
        
        
        combinedShapes.push(combinedShape)
    });



    combinedShapes.forEach(shape => {
        ctx.fill_aa(shape);
    });
    // ctx.imageSmoothingEnabled ? ctx.fill_aa(lines) : ctx.fill_noaa(lines);
}

function processTextPath(ctx,text,x,y, fill, hAlign, vAlign) {
    
    let font = findFont(ctx._font.family);
    // console.log('found font', font)
    if(!font) {
        console.warn("Font missing",ctx._font)
    }

    
    const metrics = measureText(ctx,text)
    // if(hAlign === 'start' || hAlign === 'left') /* x = x*/ ;
    if(hAlign === 'end'   || hAlign === 'right')  x = x - metrics.width
    if(hAlign === 'center')  x = x - metrics.width/2

    // if(vAlign === 'alphabetic') /* y = y */ ;
    if(vAlign === 'top') y = y + metrics.emHeightAscent
    if(vAlign === 'middle') y = y + metrics.emHeightAscent/2+metrics.emHeightDescent/2
    if(vAlign === 'bottom') y = y + metrics.emHeightDescent
    const size = ctx._font.size
    font.load(function(){
        const path = font.font.getPath(text, x, y, size)
        ctx.beginPath();
        path.commands.forEach(function(cmd) {
            
            switch(cmd.type) {
                case 'M': ctx.moveTo(cmd.x,cmd.y); break;
                case 'Q': ctx.quadraticCurveTo(cmd.x1,cmd.y1,cmd.x,cmd.y); break;
                case 'L': ctx.lineTo(cmd.x,cmd.y); break;
                case 'Z':
                {
                    ctx.closePath();
                    fill ? zfill(ctx) : ctx.stroke();
                    ctx.beginPath();
                    break;
                }
            }
        });
    });
}


export default async function boardGraphic(name, active, logo, response) {
    
    const dir = process.cwd();
    
    const img = await PImage.decodePNGFromStream(fs.createReadStream(`${dir}/data/bountyGraphic.png`));

    let logoDecoded = null;
    // get the logo
    if(logo) {
        try {
            const res = await axios({
                method: 'get',
                url: logo,
                responseType: 'stream'
            })
            
            // jpg or png?
            logoDecoded = logo.toLowerCase().endsWith('.jpg') || logo.toLowerCase().endsWith('.jpeg') ? logoDecoded = await PImage.decodeJPEGFromStream((res as any).data) :
                logo.toLowerCase().endsWith('.png') ? logoDecoded = await PImage.decodePNGFromStream((res as any).data) : null;


            // logoDecoded = await PImage.decodeJPEGFromStream((res as any).data);
            
            
            // // PImage.encodeJPEGToStream(logoDecoded, response, 0.95);
        } catch(e) {
            console.error(e);
        }
    }



    //get context
    const ctx = img.getContext('2d');
    
    // height and width of image
    const width = img.width;
    const height = img.height;

    if(ctx) {

        // return a promise
        return new Promise((res,rej)=>{
            

            PImage.registerFont(`${dir}/data/fonts/Manrope-Bold.ttf`, 'Manrope', 700, 'bold', 'normal').load( ()=>{
                ctx.fillStyle = '#fff';
                ctx.font = '24pt Manrope';
                _fonts = PImage['debug_list_of_fonts'];
                // ctx.fillStyle = '#fff';
                processTextPath(ctx,  active+' Active Rounds', width-240, height - 32, true, 'start', 'alphabetic');
                
                PImage.registerFont(`${dir}/data/fonts/Manrope-SemiBold.ttf`, 'Manrope', 600, 'semiBold', 'normal').load(() => {
                    
                    // _fonts = PImage.debug_list_of_fonts;

                    ctx.font = '48pt Manrope';
                    ctx.fillStyle = '#000000';
                    
                    // write the title

                    // split title into lines and write each line
                    const titleLines = [], lineLength = 26;
                    let title = name;
                    while(title.length > lineLength) {

                        // split at a word break
                        const splitIndex = title.substring(0, lineLength).lastIndexOf(' ');
                        if(splitIndex === -1) {
                            titleLines.push(title);
                            title = '';
                        }
                        else {
                            titleLines.push(title.substring(0, splitIndex));
                            title = title.substring(splitIndex + 1);
                        }

                    }
                    titleLines.push(title);
                    
                    
                    titleLines.forEach((titleLine, index) => {
                        processTextPath(ctx, titleLine, 220, 166 + index * 54, true, 'start', 'alphabetic');
                    })

                    // if logoDecoded is not null, draw the logo, such that it is contained in a 100x100 square of rounded corners
                    if(logoDecoded) {
                        const logoWidth = logoDecoded.width;
                        const logoHeight = logoDecoded.height;
                        const logoRatio = logoWidth / logoHeight;
                        const logoSize = 100;
                        const logoX = 96;
                        const logoY = 128;
                        const logoRadius = 16;
                        const logoWidthNew = logoRatio > 1 ? logoSize : logoSize * logoRatio;
                        const logoHeightNew = logoRatio > 1 ? logoSize / logoRatio : logoSize;
                        const logoXNew = logoX + (logoSize - logoWidthNew) / 2;
                        const logoYNew = logoY + (logoSize - logoHeightNew) / 2;
                        ctx.beginPath();
                        ctx.moveTo(logoXNew + logoRadius, logoYNew);
                        ctx.lineTo(logoXNew + logoWidthNew - logoRadius, logoYNew);
                        ctx.quadraticCurveTo(logoXNew + logoWidthNew, logoYNew, logoXNew + logoWidthNew, logoYNew + logoRadius);
                        ctx.lineTo(logoXNew + logoWidthNew, logoYNew + logoHeightNew - logoRadius);
                        ctx.quadraticCurveTo(logoXNew + logoWidthNew, logoYNew + logoHeightNew, logoXNew + logoWidthNew - logoRadius, logoYNew + logoHeightNew);
                        ctx.lineTo(logoXNew + logoRadius, logoYNew + logoHeightNew);
                        ctx.quadraticCurveTo(logoXNew, logoYNew + logoHeightNew, logoXNew, logoYNew + logoHeightNew - logoRadius);
                        ctx.lineTo(logoXNew, logoYNew + logoRadius);
                        ctx.quadraticCurveTo(logoXNew, logoYNew, logoXNew + logoRadius, logoYNew);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(logoDecoded, logoXNew, logoYNew, logoWidthNew, logoHeightNew);
                    } else {
                        // if no logo, draw the default logo which is just a box of rounded corners with black outline and no fill
                        ctx.beginPath();
                        ctx.moveTo(96 + 16, 128);
                        ctx.lineTo(96 + 100 - 16, 128);
                        ctx.quadraticCurveTo(96 + 100, 128, 96 + 100, 128 + 16);
                        ctx.lineTo(96 + 100, 128 + 100 - 16);
                        ctx.quadraticCurveTo(96 + 100, 128 + 100, 96 + 100 - 16, 128 + 100);
                        ctx.lineTo(96 + 16, 128 + 100);
                        ctx.quadraticCurveTo(96, 128 + 100, 96, 128 + 100 - 16);
                        ctx.lineTo(96, 128 + 16);
                        ctx.quadraticCurveTo(96, 128, 96 + 16, 128);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fill();

                        
                        

                    }
                        
                    
                    
                    PImage.encodePNGToStream(img, response);
                    
                })
            })
        })
    }
    else {
        return null;
    }
}