const { Client, Message } = require("discord.js")

/**
 * @param {Object} route
 * @param {boolean} condition
 * @param {Client} client
 * @param {Message} msg
 */
const Router = (route, condition, client, msg) => {
    return new Promise( (resolve, reject) => {
        try {
            if (condition) {
                await route(client, msg)
            }
            resolve()
        }catch(e){
            reject(e)
        }
    } )
}

module.exports = Router