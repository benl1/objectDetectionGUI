const { dialog } = require('electron').remote; // use remote since we're in a render thread

class ImageContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			images: [],
		}
	}

	test() {
		let files = dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{name: 'Images', extensions: ['jpg', 'png']}]
		});
		alert(files);
		if (files === undefined) {
			return;
		}

		let imgs = this.state.images;
		 // last element of imgs will always have the highest id
		let available_id = imgs.length === 0 ? 0 : (imgs[imgs.length - 1].props.id + 1);
		imgs.push(<Image key={available_id} id={available_id} rem={(id) => this.removeImage(id)} f={files}/>);
		this.setState({images: imgs});
	}

	removeImage(id) {
		let clickedIndex = dialog.showMessageBox({
			type: "question",
			message: "Are you sure you want to delete this image?",
			buttons: ["Yes", "No"]
		});
		if (clickedIndex) return;
		let imgs = this.state.images;
		imgs = imgs.filter((x) => x.props.id !== id);
		console.log(imgs);
		this.setState({images: imgs});
	}

	render() {
		return (
			<div>
				<ImageUploadButton 
					click={() => this.test()}
				/>
				<div className="imageContainer">
					{this.state.images}
				</div>
			</div>
		);
	}
}

class Image extends React.Component {
	render() {
		return (
			<div className='imageWrapper'>
				<img src={this.props.f} height='100%' width='100%'/>
				<div className='imageDelete' onClick={() => this.props.rem(this.props.id)}>x</div>
			</div>
		);
	}
}

class ImageUploadButton extends React.Component {
	render() {
		return <div className="uploader" onClick={() => this.props.click()}>test</div>;
	}
}

function TargetTitle(props) {
	return (<h3 className='targetTitle'>Select search object</h3>);
}

function SelectorPage(props) {
	return (
		<div>
			<TargetTitle />
			<ImageContainer />
		</div>
	);
}

const domContainer = document.querySelector('#root');
ReactDOM.render(
    	<SelectorPage />,
    	document.getElementById("root")
);
