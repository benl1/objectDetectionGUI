const e = React.createElement;

var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

function readURL() {
    let input = document.getElementById("targetImageUploader");

    if (input.files && input.files[0]) {
    	var reader = new FileReader();

    	reader.onload = function (e) {
        $('#imageGoesHere')
          .attr('src', e.target.result)
          .width(500)
          .height(500);
      	};
      	reader.readAsDataURL(input.files[0]);
	}
}

function UploadButton(props) {
    return e(
    	'input',//type of element to create
      	{ 
        	style: { width: "200px" },
         	type: "file",
         	id: "targetImageUploader",
         	accept: ".jpg, .png",
         	onChange: () => {readURL()}
      	} //settings object with settings for object
	);
}

function TargetTitle(props) {
	return (<h3 className='targetTitle'>Select search object</h3>);
}

function SelectorPage(props) {
	return (
		<div>
			<TargetTitle />
			<LikeButton />
	    </div>
	);
}

const domContainer = document.querySelector('#root');
ReactDOM.render(
    <SelectorPage />,
    document.getElementById("root")
);
