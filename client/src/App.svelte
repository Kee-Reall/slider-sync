<script lang="ts">
	import {onMount} from "svelte";
	import io from 'socket.io-client'
	import type {AppState} from "../../index";
	import { connect } from 'mqtt/dist/mqtt.min.js'
	import {config} from "./config.class";


	//todo session indetifyer
	//todo subscribe from mqtt only

	const id: string = (Math.random() * 10 ** 18 ).toString(36)

	let mqttState: AppState = {
		value: 0,
		locker: null
	}

	let state: AppState = {
		value: 0,
		locker: null
	}


	const client = connect(config.mqttWsUri,{
		// Clean session
		connectTimeout: 4000,
		// Authentication
		clientId: id
	})
	//
	client.on('connect', function () {
		client.subscribe('stateUpdate', function (err) {
			if (err) {
				console.log('error')
			}
			return
		})
		return
	})

	const socket = io(config.socketUri)




	let initialLocker = true

	socket.on('getStateOnInitial',(data) =>{
		try {
		const initialState = JSON.parse(data)
		state = initialState
		mqttState = initialState
		initialLocker = false
		} catch (e){
			console.log('field to set current state')
			console.error(e.message ?? 'Message is undefined')
		}
		return
	})

	socket.on('updateState',async (data)=> {
		const inp = JSON.parse(data)
		const stateFunc = {
			value : inp.value,
			locker : inp.locker
		}
		state = stateFunc
	})


	client.on('message',(topic,message)=> { //this code set data from mqtt, but it does not work from other host in lan so, i put this
		if(topic !== 'stateUpdate') {
			return
		}
		mqttState = JSON.parse(message.toString())
	})


	async function setInitialState() {
		await socket.emit('registerSession',id)
		return state
	}

	onMount(async () => {
		await setInitialState()
		return
	})


	export let name: string;

	async function changeHandler(event){
		console.log(id)
		state.value = +event.target.value
		state.locker = id
		await socket.emit('stateChange', JSON.stringify(state))
		return
	}

	async function unlockHandler() {
		await socket.emit('unlock')
		return
	}

	console.log(state)

</script>

<main>
	<p class="sign" >Мощность</p>
	<p class="power">{state.value}%</p>
	<div class="range">
		<input
			disabled={ initialLocker || !(state.locker === null || state.locker === id)}
			on:input={changeHandler}
			on:mouseup={unlockHandler}
			on:touchend={unlockHandler}
			type="range" min="0" max="100"
			value={state.value}
		/>
	</div>

	<div class="range">
		<input
				disabled={ initialLocker || !(state.locker === null || state.locker === id) }
				on:input={changeHandler}
				on:mouseup={unlockHandler}
				on:touchend={unlockHandler}
				type="range" min="0" max="100"
				value={mqttState.value}
		/>
	</div>

	<div>
		<p>первый ползунок получает данные напрямую с сервера через ws</p>
		<p>второй через очередь mqtt,</p>
		<p>
			у меня возникла проблема с отсутсвием получения данных по подписке брокера с другого хоста , тойже LAN
			однако локально работают оба способа
		</p>

		<p>
			если вы откроете порты для back энда, и front энда, вы увидете что со смартфона, также проихсодит синхронизация
			первого ползунка, однако есть проблемы с доступностью брокера внутри LAN, на которые я решил не тратить время
		</p>
	</div>
</main>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0 auto;
	}

	.sign {
		font-size: larger;
		font-weight: bold;
		margin-bottom: -3em;
	}

	.power {
		font-size: xxx-large;

	}

	.range{
	}


	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>