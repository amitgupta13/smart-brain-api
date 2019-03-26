const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const database = {
    users:[
        {
            id: '1',
            name: 'Jhon',
            email: 'jhon@jhon.com',
            password: 'jhon',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            name: 'sally',
            email: 'sally@sally.com',
            password: 'sally',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res)=>{
    res.send(database.users)
})

app.post('/signin', (req, res)=>{
    if(req.body.email === database.users[0].email 
        && req.body.password === database.users[0].password) return res.json(database.users[0]);
            res.status(400).json('error logging in');
 })

app.post('/register', (req, res)=>{
    const {email, name, password} = req.body;
     database.users.push({
        id: '3',
        name,
        email,
        password,
        entries: 0,
        joined: new Date()
     });

     res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:id', (req, res)=>{
    const {id} = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            return res.json(user);
        }
    })
    if(!found) return res.status(400).json('not found')
})

app.put('/image', (req, res)=>{
    const {id} = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            user.entries++
            return res.json(user.entries);
        }
    })
    if(!found) return res.status(400).json('not found')
})

app.listen(4000, ()=>{
    console.log('Server started on port 4000');
})
