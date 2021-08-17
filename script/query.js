const GenArt721 = require('../artifacts/GenArt721.json');const ethers = require('ethers');const fs  = require('fs')let Web3 = require('web3');const { gray, green, yellow, redBright, red } = require('chalk');const { table } = require('table');const jsonRpcProvider = 'https://mainnet.infura.io/v3/774ac4c12e754bc8b4031ac6cade4211'const webSocketProvider = 'wss://mainnet.infura.io/ws/v3/774ac4c12e754bc8b4031ac6cade4211'const ArtAddress = '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270'const projectID = 131async function checkProjectPause(genArt) {	return genArt.projectScriptInfo(projectID)}async function checkProjectActive(genArt) {	return genArt.projectTokenInfo(projectID)}const tableHeader = ['ProjectID', 'BlockNumber', 'TokenPrice', 'GasPrice', 'MintCount', 'RemainCount', 'MaxCount', 'RemainPercent']function toPercent(point){	var str=Number(point*100).toFixed(2);	str+="%";	return str;}async function main() {	const provider1 = new ethers.providers.JsonRpcProvider(jsonRpcProvider)	const genArt721 = new ethers.Contract(			ArtAddress,			GenArt721.abi,			provider1 //provider	);	const provider = new Web3.providers.WebsocketProvider(webSocketProvider)	let web3 = new Web3(provider)	const subscription = web3.eth.subscribe('newBlockHeaders', function (err, res) {		if (err) console.log(err)	}).on("connected", function(subscriptionId){		console.log(gray('-'.repeat(50)));		console.log('connect success');		console.log(gray('-'.repeat(50)));	}).on("data", async function(blockHeader){		const data = [tableHeader]		let tableContent = []		const [pause, active, gasPrice] = await Promise.all([checkProjectPause(genArt721), checkProjectActive(genArt721), provider1.getGasPrice()])		// console.log('project pause is', pause[5])		// console.log('project active is', active[4])		let remainCounts = Number(active[3]) - Number(active[2])		tableContent = tableContent.concat([projectID, blockHeader.number, `${ethers.utils.formatEther(active[1])}eth`, ethers.utils.formatUnits(gasPrice, 'gwei'), Number(active[2]), remainCounts, Number(active[3]), toPercent(remainCounts/active[3])])		data.push(tableContent)		console.log()		console.log()		console.log(table(data))	}).on("error", console.error);}main()