#!/usr/bin/env node
// This is the main initialization file.

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const fs = require("fs")
const readline = require("readline")
const mkdirp = require('mkdirp');
const git = require("simple-git")(process.cwd())
const fs2 = require('fs-extra');
clear()
console.log(
    chalk.blue(
        figlet.textSync("Mazopolis",{horizontalLayout: 'full'})
    )
)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let answers = {
    servname: undefined,
    owner: undefined,
    security: {
        token: undefined
    }
}

rl.question("[SERVER NAME] >> ",answer => {
    rl.close()
    answers.servname = answer
    console.log(chalk.green("Done! Now let's talk security. Mazopolis requires a secure connection, so your going to need one of those fancy SSL certificates! Thankfully we know where to get one. If you have your own certificate, you can skip this step by saying skip."))
    yn()
    
})

function yn() {
    mkdirp(process.cwd() + "/ssl-cert", function(err) { 
        if(err) {
            console.error(err)
        }
    });
    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl2.question("[YES or SKIP] >> ",answer => {
        rl2.close()
        if(answer.toLowerCase() == "skip") {
            console.log(chalk.green("Done! Make sure you put your certificate into the ssl-cert folder. Run the server via node index.js."))
            installServer()
        }else{
            console.log(answer)
        }
    })
}

function installServer() {
    fs.writeFile('server.json', JSON.stringify(answers), function (err) {
        if (err) throw err;
        console.log('Created config. Prepping to install server!');
        git.clone("https://github.com/Mazopolis/Mazopolis-Multiplayer-Server.git",() => {
            fs2.move(process.cwd() + '/Mazopolis-Multiplayer-Server', process.cwd() + "/mzr-server", err => {
                if(err) return console.error(err);
                console.log('success!');
            }).then(() => {
                fs2.move(process.cwd() + "/server.json",process.cwd() + "/mzr-server")
            })
        })
    });
}