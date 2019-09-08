#!/usr/bin/env node
// This is the main initialization file.

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const fs = require("fs")
const app = require("express")()
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
    security: {
        token: undefined
    }
}

rl.question("[" + chalk.blueBright("SERVER NAME") + "] >> ",answer => {
    rl.close()
    answers.servname = answer
    console.log(chalk.blueBright("Go to the following link to signin:"))
    console.log(chalk.green("https://test.mazopolis.com/cli-login"))
    var httpserver = app.listen(4837, () => console.log(chalk.blueBright("Waiting for authentication...")))
    var done = false
    app.get("**",(req,res) => {
        var token = req.query.token
        if(token) {
            if(done) {
                res.send("Well no.")
            }else{
                done = true
                answers.security.token = token
                console.log(chalk.green("Recieved authentication token!"))
                httpserver.close()
                res.send("Success! Now go back to the CLI.")
                console.log(chalk.yellow("Are you sure that you would like to install the Mazopolis Server?"))
                yn()
            }
        }else{
            res.status(400)
            res.send("whoops. that doesn't look like a token. well, i guess it doesn't look like anything either.")
        }
    })
})

function yn() {
    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl2.question("[" + chalk.green("YES") + " or " + chalk.red("NO") + "] >> ",answer => {
        rl2.close()
        if(answer.toLowerCase() == "yes" || answer.toLowerCase() == "y") {
            console.log(chalk.green("Done! Make sure you put your certificate into the ssl-cert folder. Run the server via node index.js."))
            installServer()
        }else if(answer.toLowerCase() == "no" || answer.toLowerCase() == "n"){
            console.log(chalk.blueBright("aw man! maybe next time?"))
        }else{
            console.log(chalk.blueBright("YES OR NO!???!!!!"))
            yn()
        }
    })
}

function installServer() {
    fs.writeFile('server.json', JSON.stringify(answers), function (err) {
        if (err) throw err;
        console.log(chalk.yellow('Created config. Prepping to install server!'));
        git.clone("https://github.com/Mazopolis/Mazopolis-Multiplayer-Server.git",() => {
            fs2.move(process.cwd() + '/Mazopolis-Multiplayer-Server', process.cwd() + "/mzr-server", err => {
                if(err) return console.error(err);
                fs2.move(process.cwd() + "/server.json",process.cwd() + "/mzr-server/server.json",() => {
                    mkdirp(process.cwd() + "/mzr-server/ssl-cert", function(err) { 
                        if(err) {
                            console.error(err)
                        }else{
                            console.log(chalk.green('Success!'));
                            console.log(chalk.red("IMPORTANT: ") + chalk.blueBright("Please put a valid SSL Certificate inside of the ssl-cert folder."))
                            process.exit()
                        }
                    });
                })
            })
        })
    });
}