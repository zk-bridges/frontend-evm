

export default function Bridge() {

	const validate = async ()=>{

		alert("Token submit, wait 30 min to get it an other chain")
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
				<input type="number" ></input>
			</div>
			
			<div className="zk-form" style={{justifyContent:'center'}}>
				<button onClick={()=> validate()}>Validate</button>
			</div>
		</div>)
}
