import express, { RequestHandler } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import {AppState} from "../../index";
//import mqtt from 'mqtt'


const app = express()
export const server = http.createServer(app)
const io = new Server(server,{cors:{
  credentials: true
  }})
// const mqClient = mqtt.connect('mqtt://localhost:1883')
//
// mqClient.on('connect', function () {
//   mqClient.subscribe('presence', function (err) {
//     if (!err) {
//       mqClient.publish('presence', 'Hello mqtt')
//     }
//   })
// })
//
// mqClient.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(message.toString())
//   mqClient.end()
// })
const rootHandler: RequestHandler = (_,res) => res.status(201).json({test: 'ok'})


const globalState: AppState = {
  value: 25,
  locker: null
}

let users: any = {}

io.on('connection',async (socket) => {

  socket.join('global')

  socket.on('registerSession',async function (data) {
    console.log('inside registry')
    users[`${socket.id}`] = data
    console.log(users)
    //@ts-ignore
    this.emit('getStateOnInitial',JSON.stringify(globalState))
  })

  socket.on('stateChange',async (data) => {
    const inp = JSON.parse(data)
    globalState.value = inp.value
    globalState.locker = inp.locker
    console.log(globalState)
    socket.to('global').emit('updateState',
        JSON.stringify(globalState)
    )
  })

  socket.on('unlock',async ()=>{
    globalState.locker = null
    socket.to('global').emit('updateState',
        JSON.stringify(globalState)
    )
  })


  socket.on('disconnect',async (msg) => {
    if(globalState.locker === users[socket.id]){
      globalState.locker = null
      socket.to('global').emit('updateSate')
    }
    delete users[socket.id]
    console.log(users)
    console.log(globalState)
  })

  socket.to(socket.id).emit('initial')
  socket.to('global').emit('updateState')
  console.log(users)
})

app.get('/',rootHandler)