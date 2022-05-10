const findAllTokens = (items, address) => {
    var tokenIDs =[];
    items.forEach(element => {
        collectionAddress = element.id.split(':')[1];
        if(collectionAddress===address){
            tokenIDs.push(element.tokenId);
        }
    })
    return tokenIDs;
}

module.exports = findAllTokens;