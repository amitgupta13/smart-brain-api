const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const postgres = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'hrhk',
      database : 'smartbrain'
    }
  });
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
    postgres.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data=>{
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid) {
                postgres.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user=>res.json(user[0]))
                    .catch(err=>res.status(400).json(err))
            }else{
                return res.status(400).json('wrong credentials');
            }
        })
        .catch(err=>res.status(400).json(err));
 })

app.post('/register', (req, res)=>{
    const {email, name, password} = req.body;

    const hash = bcrypt.hashSync(password);

    postgres.transaction(trx => {
         trx.insert({
            hash,
            email
        })
        .into('login')
        .returning('email')
        .then(loginemail=> {
            trx('users').returning('*').insert({
                email:loginemail[0],
                name,
                joined: new Date()
            })
            .then(user=>res.json(user[0]))
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err=>res.status(400).json(err))

    })
})

app.get('/profile/:id', (req, res)=>{
    const {id} = req.params;
    postgres.select('*').from('users').where({id})
        .then(user=>{
            if(user.length) return res.json(user[0]);
                return res.status(400).json('not found');
        })
        .catch(err=>res.status(400).json(err))
})

app.put('/image', (req, res)=>{
    const {id} = req.body;
    postgres('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries=>res.json(entries[0]))
        .catch(err=>res.status(200).json(err))
})

app.listen(4000, ()=>{
    console.log('Server started on port 4000');
})
