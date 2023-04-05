<script lang="ts">
	import io from 'socket.io-client'
	import {onMount} from "svelte";
	import type {AppState} from "../../index";
	const socket = io('http://192.168.100.28:3000')

	let id: string
	let state: AppState = {
		value: 0,
		locker: null
	}

	let initialLocker = true

	socket.on('getStateOnInitial',(data) =>{
		try {
		console.log('get first state')
		state = JSON.parse(data)
		initialLocker = false
		} catch (e){
			console.log('field to set current state')
			console.error(e.message ?? 'Message is undefined')
		}
	})

	socket.on('updateState',async (data)=> {
		const inp = JSON.parse(data)
		const stateFunc = {
			value : inp.value,
			locker : inp.locker
		}
		state = stateFunc

	})

	async function setInitialState() {
		await socket.emit('registerSession',id)
		return state
	}

	onMount(async () => {
		id = (Math.random() * 10 ** 18 ).toString(36)
		await setInitialState()
	})


	export let name: string;

	async function changeHandler(event){
		console.log(id)
		state.value = +event.target.value
		state.locker = id
		await socket.emit('stateChange', JSON.stringify(state))
	}

	async function unlockHandler() {
		await socket.emit('unlock')
	}

	console.log(state)

</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
		<p>Мощность {state.value} % </p>
		<input
			disabled={ initialLocker || !(state.locker === null || state.locker === id)}
			on:input={changeHandler}
			on:mouseup={unlockHandler}
			on:touchend={unlockHandler}
			type="range" min="0" max="100"
			value={state.value}
		>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>