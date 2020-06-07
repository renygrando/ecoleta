const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db")

//configurar pasta publica
server.use(express.static("public"))

server.use(express.urlencoded ({extended: true}))

//utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//configurando rotas da aplicação
//req: requisição
//res: resposta
server.get("/", (req, res) => {
    return res.render("index.html", {title: "Seu Marketplade de coleta de resíduos"})
})
server.get("/create-point", (req, res) => {
    //req.query : Query strings da nossa url
    // console.log(req.query)

    return res.render("create-point.html")
})
server.post("/savepoint", (req, res) => {
    const query = `
            INSERT INTO places (
                image,
                name,
                address,
                address2,
                state,
                city,
                items
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        `
        const values = [
            req.body.image,
            req.body.name,
            req.body.address,
            req.body.address2,
            req.body.state,
            req.body.city,
            req.body.items,
        ]
    
        function afterInsertData(err) {
            if(err) {
                console.log(err)
                return res.send("Erro no cadastro")
                //fazer página do erro e colocar aqui--
            }
            console.log("cadastrado com sucesso!")
            console.log(this)
            return res.render("create-point.html", {saved: true})
        }
    
        db.run(query, values, afterInsertData) 

})


server.get("/search", (req, res) => {

    const search = req.query.search
    if(search == "") {
        return res.render("search-results.html", {total: 0})
    }

    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }
        const total = rows.length

        console.log("Aqui estão seus registros: ")
        console.log(rows)
        return res.render("search-results.html", { places: rows, total: total })
    })

    
})

//ligar o servidor
server.listen(3000)
console.log("servidor em execução")