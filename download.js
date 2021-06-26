import fs from 'fs'
import axios from 'axios'
import chalk from 'chalk'
import UserAgent from 'user-agents'
import HttpsProxyAgent from 'https-proxy-agent'

(async () => {
    console.log(chalk.blue.bold('---------------------[App started]---------------------'))
    console.log('')
    console.log(chalk.green.bold('Info: ')+chalk.blue('Reading Links file...'))
    const file = fs.readFileSync("./links.txt", 'utf-8')
    const links = file.split('\r\n').filter(each => each)
    console.log(chalk.green.bold('Info: ')+chalk.blue(`${links.length} links found!`))
    console.log(chalk.green.bold('Info: ')+chalk.blue('Initiating instagram downloader'))
    console.log('')
    console.log(chalk.green.bold('Info: ')+chalk.blue('Output Dir: videos'))
    console.log(chalk.green.bold('Info: ')+chalk.blue('Output Res: Maximum'))
    console.log('')

    function getProxy() {
        console.log(chalk.green.bold('Info: ')+chalk.blue('Reading Proxies file...'))
        const file = fs.readFileSync('./proxies.txt', 'utf-8')
        const proxies = file.split('\r\n').filter(each => each)
        console.log(chalk.green.bold('Info: ')+chalk.blue(`${proxies.length} proxies found!`))
        console.log(chalk.green.bold('Info: ')+chalk.blue('Getting random proxy'))
        const random = proxies[Math.floor(Math.random() * proxies.length)].split(':')
        const proxy = `http://${random[2]}:${random[3]}@${random[0]}:${random[1]}`
        console.log(chalk.green.bold('Info: ')+chalk.blue(`Now using: ${proxy}`))

        return proxy
    }
    console.log(chalk.green.bold('Info: ')+chalk.blue('Creating HTTP agent'))
    const agent = new HttpsProxyAgent(getProxy())
    const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));

    console.log(chalk.green.bold('Info: ')+chalk.blue('Creating fake user agent'))
    const userAgent = new UserAgent();
    for (let i = 0; i < links.length; i++) {
        const videoId = /https?:\/\/(?:www.)?instagram.com\/reel\/([^\/?#&]+).*/gm.exec(links[i])
        const url = `https://www.instagram.com/p/${videoId[1]}/?__a=1`
        console.log(url)
        await delay(3000)
        await axios({
            method: 'get',
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'User-agent': userAgent.toString()
            },
            data : JSON.stringify({url: links[i]}),
            httpsAgent: agent
        })
            .then(response => response.data)
            .then(data => {
                console.log(data)
                if (data.graphql && data.shortcode && data.shortcode_media.__typename === 'GraphVideo') {
                    console.log(chalk.green.bold('Info: ')+chalk.blue(`Downloading: ${videoId}`))
                } else console.warn(chalk.yellow('Warn: ')+chalk.bold('Video Metadata not found!'))
            })
            .catch(error => console.error(chalk.red(error)))
    }
    console.log(chalk.blue.bold('---------------------[Process finished]---------------------'))
})()
