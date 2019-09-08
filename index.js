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

rl.question("[" + chalk.blueBright("SERVER NAME") + "] >> ",answer => {
    rl.close()
    answers.servname = answer
    console.log(chalk.green("Done! Now let's talk security. Mazopolis requires a secure connection, so your going to need one of those fancy SSL certificates! Thankfully we know where to get one. Head over to Let's Encrypt to generate a certificate. (https://letsencrypt.org). If you have your own certificate, you can use that. Now to the fun part! Would you like to install the server?"))
    yn()
    
})

function yn() {
    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl2.question("[" + chalk.green("YES") + " or " + chalk.red("NO") + "] >> ",answer => {
        rl2.close()
        if(answer.toLowerCase() == "yes") {
            console.log(chalk.green("Done! Make sure you put your certificate into the ssl-cert folder. Run the server via node index.js."))
            installServer()
        }else if(answer.toLowerCase() == "no"){
            console.log(chalk.blueBright("aw man! maybe next time?"))
        }else{
            console.log(chalk.blueBright("YES OR NO!!!!"))
            yn()
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
                fs2.move(process.cwd() + "/server.json",process.cwd() + "/mzr-server/server.json",() => {
                    mkdirp(process.cwd() + "/mzr-server/ssl-cert", function(err) { 
                        if(err) {
                            console.error(err)
                        }else{
                            console.log(chalk.green('success!'));
                        }
                    });
                })
            })
        })
    });
}