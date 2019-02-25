const e = React.createElement;

class UploadButton extends React.Component {
	clickHandler(evt) {
		alert('hello!');
	}

	render() {
		return (<div className='imageBox' onClick={this.clickHandler}></div>);
	}
}

function TargetTitle(props) {
	return (<h3 className='targetTitle'>Select search object</h3>);
}

function SelectorPage(props) {
	return (
		<div>
			<TargetTitle />
			//<UploadButton />
	    	</div>
	);
}

const domContainer = document.querySelector('#root');
ReactDOM.render(
    	<SelectorPage />,
    	document.getElementById("root")
);
