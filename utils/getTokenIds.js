const getTokenIds = (items) => {
    var tokenIDs =[];
    items.forEach(element => {
        tokenIDs.push(element.tokenId);
    })
    return tokenIDs;
}

module.exports = getTokenIds;