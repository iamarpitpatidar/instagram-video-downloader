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
        const file = fs.readFileSync('./proxies.txt', 'utf-8')
        const proxies = file.split('\r\n').filter(each => each)
        const random = proxies[Math.floor(Math.random() * proxies.length)]

        return `http://${random[3]}:${random[4]}@${random[2]}:${random[1]}`
    }
    console.log(chalk.green.bold('Info: ')+chalk.blue('Creating HTTP agent'))
    const agent = new HttpsProxyAgent(getProxy())
    const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));

    const userAgent = new UserAgent();
    for (let i = 0; i < links.length; i++) {
        await delay(3000)
        await axios({
            method: 'post',
            url: 'https://shielded-basin-48291.herokuapp.com/api/post',
            headers: {
                'Content-Type': 'application/json',
                'User-agent': userAgent.toString()
            },
            data : JSON.stringify({url: links[i]}),
            httpsAgent: agent
        })
            .then(response => response.data)
            .then(data => {
                if (data.type && data.links) {
                    console.log(chalk.green.bold('Info: ')+chalk.blue(`Downloading: ${/https?:\/\/(?:www.)?instagram.com\/reel\/([^\/?#&]+).*/gm.exec(data.links.video)}`))
                } else console.warn(chalk.yellow('Warn: ')+chalk.bold('Video Metadata not found!'))
            })
            .catch(error => console.error(chalk.red(error)))
    }
    console.log(chalk.blue.bold('---------------------[Process finished]---------------------'))
})()
