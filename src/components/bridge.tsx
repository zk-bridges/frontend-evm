import * as React from 'react'
import { useDebounce } from 'use-debounce'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'

export default function Bridge() {

	const [to, setTo] = React.useState('0x932f80fc3d023e8dac12a3ae2a8611fdd3cf360f')
	const [debouncedTo] = useDebounce(to, 500)

	const [amount, setAmount] = React.useState('')
	const [debouncedAmount] = useDebounce(amount, 500)

	const { config } = usePrepareSendTransaction({
		to: debouncedTo,
		value: debouncedAmount ? parseEther(debouncedAmount) : undefined,
	})

	const { sendTransaction } = useSendTransaction(config);

	const validate = async () => {

		sendTransaction?.();
		setTimeout(() => {
			alert("Token submit, wait 30 min to get it an other chain")
		}, 10000);
		
	};


	return (
		<div>
			<div className="zk-form">
				<label>From : </label>
				<select>
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
				<label>To : </label>
				<select>
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
				<input type="number" value={amount} onChange={(ev) => setAmount(ev.currentTarget.value)} ></input>
			</div>

			<div className="zk-form" style={{ justifyContent: 'center' }}>
				<button onClick={(e) => {
					validate()
				}}>Validate</button>
			</div>
		</div>)
}
