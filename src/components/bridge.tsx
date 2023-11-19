import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Address, encodeAbiParameters, parseEther } from 'viem';
import {
	useAccount,
	useContractWrite,
	usePrepareContractWrite,
	useWaitForTransaction,

} from 'wagmi';

export default function Bridge() {

	const scrollAdr = "0x3808d0F2F25839E73e0Fbf711368fC4aE80c7763";
	const zkEvmAdr = "";
	const lineaAdr = "0x711A70b4e2af3388a0E4061e53AAd2267439270D";
	const l1BridgeAdr = "0x932f80fc3d023e8dac12a3ae2a8611fdd3cf360f";

	//const [{ data: signData }, getSigner] = useSigner();
	const { address, connector, isConnected } = useAccount()

	const [from, setFrom] = useState<string>(scrollAdr)
	const [debouncedFrom] = useDebounce(from, 500)

	const [account, setAccount] = useState<Address>(address || "0xDBf0DC3b7921E9Ef897031db1DAe239B4E45Af5f")
	const [debouncedAccount] = useDebounce(account, 500)

	const [to, setTo] = useState<string>("59140")
	const [debouncedTo] = useDebounce(to, 500)

	const [amount, setAmount] = useState('0.01')
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

	const { config,
		error: prepareError,
		isError: isPrepareError } = usePrepareContractWrite({
			address: debouncedFrom as any,
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
			args: [l1BridgeAdr, parseEther(debouncedAmount), encode, 1000000],
			value: parseEther(debouncedAmount),
			
		});
	const { data, error, isError, write } = useContractWrite(config);

	const { isLoading, isSuccess } = useWaitForTransaction({
		hash: data?.hash,
	})

	const validate = async () => {

		console.log("debouncedAmount", parseEther(debouncedAmount));
		write?.();
		console.log("write", write);
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
