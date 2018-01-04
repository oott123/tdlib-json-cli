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
                output = processFunctionOrObject(name, html, type)
                break;
        }
    } catch (e) {
        console.log(`Parse failed: ${name}, ${url}`)
        throw e
    }
    output.type = type
    output.url = htmlName.replace(/^\.\/td\/docs\/html/, 'https://core.telegram.org/tdlib/docs')
    return output
}

function processFunctionOrObject(name, html, type) {
    const matches = html.match(/Public Attributes<\/h2>((?:.|\n)*)Static Public Attributes/)
    const args = []
    const result = {fields: args}
    if (matches) {
        const part = matches[1]
        part.replace(/<tr class="memitem:((?:.|\n)*?)<\/tr>(?:.|\n)*?<tr class="memdesc:((?:.|\n)*?)<\/tr>/g, function (_, itemPart, descPart) {
            let field = {}
            itemPart
            .replace(/&#160;/g, '')
            .replace(/\/a>\n(.*?)<\/td>.*>(.*)<\/a>/, function (_, type, name) {
                type = parseType(type)
                name = entities.decode(name).replace(/_$/, '')
                field.type = type
                field.name = name
            })
            descPart
            .replace(/<br \/>/, '\n')
            .replace(/"mdescRight">((?:.|\n)+)<\/td>/, function (_, desc) {
                desc = entities.decode(desc)
                desc = desc.trim()
                field.desc = desc
            })
            args.push(field)
        })
    }
    html.replace(/<area href="[^"]*" alt="td::td_api::([^"]+)"/, function (_, name) {
        name = name
        .replace(/Object/, 'TDObject')
        .replace(/Function/, 'TDFunction')
        result.extends = name
    })
    html.replace(/Detailed Description<\/h2>\n<div class="textblock">((?:.|\n)*?)<h2/, function (_, text) {
        text = text
        .replace(/<p>(.*?)<\/p>/g, '$1\n')
        .replace(/<.*?>|<\/.*?>/g, '')
        .replace(/\n+/, '\n')
        .trim()
        result.desc = entities.decode(text)
    })
    if (type === 'function') {
        // parse return type
        html.replace(/ReturnType<\/a> = (.*?)<\/td>/, function (_, returnType) {
            result.returnType = parseType(returnType)
        })
    }
    return result
}

function parseType(type) {
    type = type.replace(/<.*?>(.*?)<\/.*?>/g, '$1')
    type = entities.decode(type)
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
