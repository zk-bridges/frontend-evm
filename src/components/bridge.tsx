import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Address, encodeAbiParameters, parseEther } from 'viem';
import {
	useAccount,
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,
	useNetwork
} from 'wagmi';

export default function Bridge() {

	const scrollAdr = "0xb75d7e84517e1504C151B270255B087Fd746D34C";
	const zkEvmAdr = "0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7";
	const lineaAdr = "0x711A70b4e2af3388a0E4061e53AAd2267439270D";
	const l1BridgeAdr = "0x932f80fc3d023e8dac12a3ae2a8611fdd3cf360f";

	//const [{ data: signData }, getSigner] = useSigner();
	const { address, connector, isConnected } = useAccount()

	const { chain, chains } = useNetwork()

	const [from, setFrom] = useState<string>(scrollAdr)
	const [debouncedFrom] = useDebounce(from, 500)

	const [account, setAccount] = useState<Address>(address || "0xDBf0DC3b7921E9Ef897031db1DAe239B4E45Af5f")
	const [debouncedAccount] = useDebounce(account, 500)

	const [to, setTo] = useState<string>("59140")
	const [debouncedTo] = useDebounce(to, 500)

	const [amount, setAmount] = useState('0.001')
	const [debouncedAmount] = useDebounce(amount, 500)

	const [encode, setEncode] = useState<string>("")

	useEffect(() => {
		let val = encodeAbiParameters(
			[
				{ name: 'chainId', type: 'uint64' },
				{ name: 'user', type: 'address' }
			],
			[BigInt(debouncedTo), debouncedAccount]
		);
		setEncode(val);
	}, [account, debouncedTo]);

	const { config: config,
		error: prepareError,
		isError: isPrepareError } = usePrepareContractWrite({
			address: chain?.id == 534353 ? scrollAdr : undefined as any,
			abi: [
				{
					name: 'sendMessage',
					type: 'function',
					stateMutability: 'payable',
					inputs: [{ "type": "address", "name": "_to", "internalType": "address" },
					{ "type": "uint256", "name": "_value", "internalType": "uint256" },
					{ "type": "bytes", "name": "_message", "internalType": "bytes" },
					{ "type": "uint256", "name": "_gasLimit", "internalType": "uint256" }],
					outputs: [],
				},
			],
			functionName: 'sendMessage',
			args: [l1BridgeAdr, (parseEther(debouncedAmount) / BigInt(2)), encode, 1000000],
			value: parseEther(debouncedAmount),

		});

	const { data, error, isError, write } = useContractWrite(config);

	const { config: config2,
		error: prepareError2,
		isError: isPrepareError2 } = usePrepareContractWrite({
			address: zkEvmAdr as any,
			abi: [
				{
					name: 'bridgeMessage',
					type: 'function',
					stateMutability: 'payable',
					inputs: [{ "internalType": "uint32", "name": "destinationNetwork", "type": "uint32" },
					{ "internalType": "address", "name": "destinationAddress", "type": "address" },
					{ "internalType": "bool", "name": "forceUpdateGlobalExitRoot", "type": "bool" },
					{
						"internalType": "bytes", "name": "metadata", "type": "bytes"
					}],
					outputs: [],
				},
			],
			functionName: 'bridgeMessage',
			args: [0x0, l1BridgeAdr, 0x0, encode],
			value: parseEther(debouncedAmount),

		});


	const { data: data2, error: error2, isError: isError2, write: write2 } = useContractWrite(config2);

	const { isLoading: isLoading2, isSuccess: isSuccess2 } = useWaitForTransaction({
		hash: data2?.hash,
	})


	const { isLoading, isSuccess } = useWaitForTransaction({
		hash: data?.hash,
	})

	const validate = async () => {

		if (from == scrollAdr) {
			write?.();
			console.log("write", write);
		} else {

			write2?.();
			console.log("write2", write2);
		}
	};


	return (
		<div>
			<div className="zk-form">
				<label>From : </label>
				<select value={from} onChange={(ev) => setFrom(ev.target.value)}>
					<option value={scrollAdr}>
						Scroll
					</option>
					<option value={zkEvmAdr}>
						Polygon ZkEvm
					</option>
				</select>
			</div>
			<div className="zk-form">
				<label>To : </label>
				<select value={to} onChange={(ev) => setTo(ev.target.value)}>
					<option value="59140">
						Linea
					</option>
					<option value="534353">
						Scroll
					</option>
					<option value="1442">
						Polygon ZkEvm
					</option>
				</select>
			</div>
			<div className="zk-form">
				<label>Amount : </label>
				<input type="number" value={amount} onChange={(ev) => setAmount(ev.target.value)} ></input>
			</div>

			<div className="zk-form">
				<label>Receiver : </label>
				<input type="text" value={account} onChange={(ev) => setAccount(ev.target.value)} ></input>
			</div>


			{isSuccess && (
				<div>
					Successfully sent {amount} ether to {to}
					<div>
						<a>Tx id, wait 30 min to finish bridge : {data?.hash}</a>
					</div>
				</div>
			)}

			{isSuccess2 && (
				<div>
					Successfully sent {amount} ether to {to}
					<div>
						<a>Tx id, wait 30 min to finish bridge : {data?.hash}</a>
					</div>
				</div>
			)}

			{(isPrepareError || isError) && (
				<div>Error: {(prepareError || error)?.message}</div>
			)}

			<div className="zk-form" style={{ justifyContent: 'center' }}>
				<button onClick={(e) => {
					validate()
				}}>Validate</button>
			</div>
		</div>)
}
