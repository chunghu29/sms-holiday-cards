const { htmlToText } = require('html-to-text');

module.exports = (xml) => {
    let get = xml.indexOf("Get it now");
    let left = xml.slice(0, get);
    let start = left.lastIndexOf('<table');
    //console.log(start);
    let end = xml.indexOf('</table>', get);
    xml = xml.slice(start, end + 8);
    //console.log(`start=${start}, end=${end} xml=${xml}`);
    return htmlToText(xml);
};