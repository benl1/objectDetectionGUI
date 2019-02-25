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

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {

    return e(
      'input',//type of element to create
      { 
         style: {
             width: "200px"
         },
         type: "file",
         id: "targetImageUploader",
         accept: ".jpg, .png",
         onChange: () => {readURL()}
         } //settings object with settings for object
    );
  }
}

class TargetTitle extends React.Component {

    render() {
        return e(
            'h3',
            {
                className: "targetTitle"

            },
            "Select search object"
        )
    }

}

class SelectorPage extends React.Component {
    render() {
        return (
            <div>
                <div>
                    <TargetTitle />
                </div>
                <div> 
                    <LikeButton />
                </div>
            </div>
            
        );
    }
}



const domContainer = document.querySelector('#root');
ReactDOM.render(
    <SelectorPage />,
    document.getElementById("root")
);