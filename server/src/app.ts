import express, { RequestHandler } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import mqtt from 'mqtt'
import {AppState} from "../../index";


//todo input validation
//todo fix codestyle


const app = express()
export const server = http.createServer(app)
const io = new Server(server,{cors:{
  credentials: true
  }})
const mqClient = mqtt.connect('mqtt://localhost:1883')


const rootHandler: RequestHandler = (_,res) => res.status(201).json({test: 'ok'}) // only for test


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
    //@ts-ignore
    const that = this as {emit: Function}  // this in this context is specified socket witch emit event only on emmiter connection
    that.emit('getStateOnInitial',JSON.stringify(globalState))
  })

  socket.on('stateChange',async (data) => {
    const inp = JSON.parse(data)
    globalState.value = inp.value
    globalState.locker = inp.locker
    mqClient.publish('stateUpdate',JSON.stringify(globalState))
    console.log(globalState)
    socket.to('global').emit('updateState',
        JSON.stringify(globalState)
    )
  })

  socket.on('unlock',async ()=>{
    globalState.locker = null
    mqClient.publish('stateUpdate',JSON.stringify(globalState))
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