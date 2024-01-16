const path = require('path')
const express = require('express')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { Client } = require('pg')
const client = new Client({
  user: process.env.DATABASE_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
})
client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
const app = express();
const publicDir = path.join(__dirname, './public')

app.set('view engine', 'hbs')
app.use(express.static(publicDir))
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body

    client.query('SELECT username FROM users WHERE username = $1', [username], async (error, result) => {
        if(error){
            console.log(error)
        }
        if(result.rowCount > 0){
            return res.render('register', {
                message: 'This username is already in use'
            })
        } 
        const hPassword = bcrypt.hashSync(password, 8)
        client.query('INSERT INTO users (username, password) VALUES($1, $2)', [username, hPassword], (err, result1)=>{
            if(err){
                console.log(err)
            } else {
                return res.render('register', {
                    message: 'user registered'
                })
            }
        })
    })
})

app.post('/auth/login', (req, res)=>{
    const { username, password } = req.body
    client.query('SELECT username, password FROM users WHERE username = $1', [username], async (err, result)=>{
        if(err){
            console.log(err)
        }
        if(result.rowCount == 0){
            return res.render('login', {
                message: 'no such a user'
            })
        } 
        if(bcrypt.compare(password, result.rows[0].password)){
            return res.render('index', {
                username: username
            })
        } else {
            return res.render('login', {
                message: 'wrong password'
            })
        }

    })
})

app.listen(8000, ()=>{
    console.log('server started on port 8000')
})

