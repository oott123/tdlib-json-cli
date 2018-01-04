const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

;(async function () {
    const rootHtml = (await readFile('./td/docs/html/hierarchy.html')).toString()
    const promisies = []
    const output = {}
    rootHtml.replace(/<a class="el" href="([^"]+)" target="_self">(td::td_api::[^<]+)<\/a>/g, function (_, url, name) {
        promisies.push((async function () {
            let result = await processToken(name, url)
            if (result && result.type !== 'unkown') {
                output[name.replace(/^td::td_api::/, '')] = result
            }
        })())
    })
    await Promise.all(promisies)
    await writeFile('./types.json', JSON.stringify(output, null, 2))
})()
.catch(function (err) {
    console.error(err)
})

async function processToken(name, url) {
    const htmlName = `./td/docs/html/${url}`
    const html = (await readFile(htmlName)).toString()
    if (name.match(/td::td_api::[A-Z]/)) {
        // return false
    }
    let type
    if (html.match(/<area [^>]*alt="td::td_api::Object"/)) {
        type = 'object'
    } else if (html.match(/<area [^>]*alt="td::td_api::Function"/)) {
        type = 'function'
    } else {
        type = 'unkown'
    }
    let output = {}
    try {
        switch (type) {
            case 'function':
            case 'object':
                output = processFunctionOrObject(name, html)
                break;
        }
    } catch (e) {
        console.log(`Parse failed: ${name}, ${url}`, e)
    }
    output.type = type
    return output
}

function processFunctionOrObject(name, html) {
    const matches = html.match(/Public Attributes<\/h2>((?:.|\n)*)Static Public Attributes/)
    const args = []
    const result = {fields: args}
    if (matches) {
        const part = matches[1]
        const arg = []
        part.replace(/<tr class="memitem:((?:.|\n)*?)<\/tr>(?:.|\n)*?<tr class="memdesc:((?:.|\n)*?)<\/tr>/g, function (_, itemPart, descPart) {
            itemPart
            .replace(/&#160;/g, '')
            .replace(/\/a>\n(.*?)<\/td>.*>(.*)<\/a>/, function (_, type, name) {
                type = type.replace(/<.*?>(.*?)<\/.*?>/g, '$1')
                type = entities.decode(type)
                type = parseType(type)
                name = entities.decode(name).replace(/_$/, '')
                let a = {type, name}
                arg.push(a)
                args.push(a)
            })
            let index = 0
            descPart
            .replace(/<br \/>/, '\n')
            .replace(/"mdescRight">((?:.|\n)+)<\/td>/, function (_, desc) {
                desc = entities.decode(desc)
                desc = desc.trim()
                arg[index].desc = desc
                index++
            })
        })
    }
    html.replace(/<area href="[^"]*" alt="td::td_api::([^"]+)"/, function (_, name) {
        name = name
        .replace(/Object/, 'TDObject')
        .replace(/Function/, 'TDFunction')
        result.extends = name
    })
    return result
}

function parseType(type) {
    return type
    .replace(/object_ptr< ([^>]+) >/g, '$1')
    .replace(/std::vector< ([^>]+) >/g, '$1[]')
    .replace(/std::vector< ([^>]+) >/g, '$1[]')
    .replace(/std::vector< ([^>]+) >/g, '$1[]')
    .replace(/std::vector< ([^>]+) >/g, '$1[]')
    .replace('std::int32_t', 'number')
    .replace('std::int64_t', 'string')
    .replace('std::string', 'string')
}
