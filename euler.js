console.log('Euler Initiating...');

require('dotenv').config();
const loginToken = process.env.DISCORD_TOKEN;

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(loginToken);

const puppeteer = require('puppeteer');
const fs = require('fs');

let prefix = "do.";

const commands = 
[
    'sqrt - returns the square root of a number \nExample: do. sqrt 64 \nThis returns square root of 64 which is 8',
    'root - returns the root of a number thats passed in as input \nExample: do. root 27 3 \nReturns the the 3rd root of 27 which is 3',
    'pow - returns a numbers raised to another number that are passed in as input \nExample: do. pow 9 2 \nThis will return 81 which is 9 raised to 2',
    'quad - returns the solutions of the quadratic equation entered \nExample: do. quad 3 -9 2  \nThis returns the solution to the quadratic 3x^2-9x+2',
    'info - returns information about the function entered as an image \nExample: do. info x^2+sin(x)',
    'deriv - returns the derivative of the function passed in as an image \nExample: do. deriv ln(x)/sin(x) \nThis returns the derivative of f(x)=ln(x)/sin(x)'
];

const blacklistedWords = 
[
    ""
];

client.on('ready', ()=>{console.log('Euler Online!');});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'gg');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});

client.on('message', async msg => 
{
    fs.readFile('prefixrec.txt', (err, data) => {
        if (err) throw err;
        prefix = data;
    });
    
    if(msg.author.bot == true) return;

    if(msg.content.startsWith(prefix) == false || msg == null) 
    {
        return;
    }
    
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    var result = 'operation';   
    cmd_lc = cmd.toLowerCase();

    if(cmd_lc == 'help')
    {
        const startNotation = '-->';
        let finalMsg = 'Commands :';
        for(i = 0; i < commands.length; i++)
        {
            finalMsg += '\n\n'
            finalMsg += (i+1).toString() + "> " +prefix +" "+commands[i];
        }
        await msg.channel.send('***'+ finalMsg+'***');
    }

    try
    {
        switch(cmd_lc)
        {
            default:
                return;
            case "args":
                result = args.toString();
                break;
            case "sqrt":
                var r = ParseFloat(args, 1);
                result = Math.sqrt(r).toString();
                break;
            case "pow":
                var r = ParseFloat(args, 2);
                result = Math.pow(r[0], r[1]).toString();
                break;
            case "root":
                var r = ParseFloat(args, 2);
                result = Math.pow(r[0], 1/r[1]).toString();
                break;
            case 'quad':
                var r = ParseFloat(args, 3);
                result = SolveQuad(r[0], r[1], r[2]).toString();
                break;

            case 'deriv':
                var r = args[0];
                input_function = r;
                sym_func = `(${ParseSymbolabInput(input_function)})`;
                request_path ="https://www.symbolab.com/solver/derivative-calculator/d%2Fdx"+sym_func.toString();
                img_path = `./current_deriv${Math.floor(Math.random()*999999999)}.png`;

                if(fs.existsSync(img_path)){
                    fs.unlinkSync(img_path);
                }
                Wait(msg);
                await RequestWebScreenshot(img_path, request_path, 1000, 1600).then(async ()=>{
                         SendTLocalFileToDiscord(img_path, "Evaluated Derivative >>", msg)}).catch(console.error);
                return;

            case 'info':
                var r = args[0];
                input_function = r;
                sym_func = `(${ParseSymbolabInput(input_function)})`;
                request_path ="https://www.symbolab.com/solver/pre-calculus-functions-calculator/f(x)="+sym_func.toString();
                img_path = `./current_info${Math.floor(Math.random()*999999999)}.png`;

                if(fs.existsSync(img_path)){
                    fs.unlinkSync(img_path);
                }
                Wait(msg);
                await RequestWebScreenshot(img_path, request_path, 1000, 1600).then(async ()=>{
                        SendTLocalFileToDiscord(img_path, "Evaluated Info >>", msg)}).catch(console.error);
                return;
            case 'int':
                var r = args[0];
                input_function = r;
                sym_func = `(${ParseSymbolabInput(input_function)})`;
                integral = 'integral('+sym_func.toString() +')';
                request_path = "https://www.symbolab.com/solver/step-by-step/" + integral.toString();
                img_path = `./current_info${Math.floor(Math.random() * 999999999)}.png`;

                if (fs.existsSync(img_path)) {
                    fs.unlinkSync(img_path);
                }
                Wait(msg);
                await RequestWebScreenshot(img_path, request_path, 1000, 1600).then(async () => {
                    SendTLocalFileToDiscord(img_path, "Evaluated Indefinite Integral >>", msg)
                }).catch(console.error);
                return;

            case 'hirag':
                var r = args.join(' ');
                img_path = `./current_info${Math.floor(Math.random()*999999999)}.png`;
                request_path = 'https://www.lexilogos.com/keyboard/hiragana.htm';
                if(fs.existsSync(img_path)){
                    fs.unlinkSync(img_path);
                }
                Wait(msg)
                await TranscribeToJapanese(img_path, request_path, r).then(async ()=>{
                    SendTLocalFileToDiscord(img_path, "Transcription to Hiragana>> ", msg).catch(console.error);
                });
                return;
            case 'kat':
                var r = args.join(' ');
                img_path = `./current_info${Math.floor(Math.random()*999999999)}.png`;
                request_path = 'https://www.lexilogos.com/keyboard/katakana.htm';
                if(fs.existsSync(img_path)){
                    fs.unlinkSync(img_path);
                }
                Wait(msg)
                await TranscribeToJapanese(img_path, request_path, r).then(async ()=>{
                    SendTLocalFileToDiscord(img_path, "Transcription to Katakana>> ", msg).catch(console.error);
                });
                return;

            case "netcheck":
                await msg.channel.send("I am online!")
                return;

            case "newprefix":
                let newPrefix = args[0];
                if(newPrefix == "" || newPrefix == " ")
                {
                    newPrefix = "do.";
                }
                fs.writeFile('prefixrec.txt', newPrefix, (err) => {
                    if (err) throw err;
                    msg.channel.send(`Prefix changed to ${newPrefix}`)
                })
                return;
            case "devinfo":
                msg.channel.send("Bot Developer: Shariar Papon\nDate Released: 5/21/2020\nFramework: Node.js - Discord.js");
                break;
        }
    } 
    catch
    {
        console.log(console.error);
        await msg.reply("FATAL ERROR : PROCESS TERMINATED");
        return;
    }
    
    const _embed = new Discord.MessageEmbed().setColor('#0099ff').setTitle(result).setFooter(`${cmd}(${args})`);
    await msg.channel.send(_embed);
});

function Wait(msg, wait_msg = "Fetching data! Might take few seconds...")
{
    msg.channel.send(wait_msg);
}

async function RequestGoogleImageSearch(searchTerm)
{
    const sURL = "https://www.google.com/search?tbm=isch&q=" + searchTerm.toString();
    //#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy.mM5pbd
}

async function SendTLocalFileToDiscord(file_path, header, msg)
{
    if (fs.existsSync(file_path)) 
    {
        await msg.channel.send(header, {files: [file_path]});
        fs.unlinkSync(file_path);
    }
}

async function TranscribeToJapanese(img_path, request_path, terms)
{
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox',]});
    const page = await browser.newPage();
    await page.goto(request_path, {"waitUntil" : "networkidle0"});
    await page.type('#bar', terms);
    await page.screenshot({path: img_path});
    await browser.close();
}

async function RequestWebScreenshot(img_path, request_path, img_width = 1000, img_height = 1000)
{
    const browser = await puppeteer.launch({headless: true, 
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',]});
    const page = await browser.newPage();
    await page.goto(request_path, {"waitUntil" : "networkidle0"});
    await page.setViewport({ width: img_width, height: img_height, });
    await page.screenshot({
        path: img_path,
        clip: 
        {
            x: 50,
            y: 500,
            width: 840,
            height: 700
        }
    });
    await browser.close();
}

function ParseSymbolabInput(inputFunction)
{
    const divSymbol = '%2F';
    var symInput = "";

    for(i = 0; i < inputFunction.length; i++)
    {
        if(inputFunction[i] != '/')
            symInput += inputFunction[i];
        else if(inputFunction[i] == '/')
            symInput += divSymbol;
    }
    return symInput;
}

function ParseFloat(args, count)
{
    parsed_floats = [];

    for(i = 0; i < count; i++)
        parsed_floats[i] = parseFloat(args[i]);

    return parsed_floats;
}

function SolveQuad(a, b, c)
{
    b_sqr = b*b;
    in_rad = b_sqr - (4*a*c);

    if(in_rad < 0) return 'Undefined';

    den = 2*a;
    rad = Math.sqrt(in_rad);
    x1 = (-b + rad) / den;
    x2 = (-b - rad) / den;
    ans = "x = " + x1 + ", " + x2;

    return ans;
}
