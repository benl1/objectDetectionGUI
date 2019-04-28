// image_choice_screen.test.js
import React from 'react';
import { shallow, mount } from 'enzyme';
import ImageChoiceScreen from '../src/image_choice_screen/image_choice_screen';
import { ImageContainer, CroppingArea, UploadImageButton } from '../src/image_choice_screen/image_choice_screen';

import renderer from 'react-test-renderer';
import App from '../src/control/app';
describe('Image Choice screen', () => {
    it('test that image choice renders', ()=>{
        const component = renderer.create(
            <ImageChoiceScreen app={new App()} />,
            document.getElementById('root')
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('test that image choice renders cropping area when the state is changed', ()=>{        
        let component = shallow( <ImageContainer app={new App()} />);
        expect(component.find(CroppingArea)).toHaveLength(0);        
        component.instance().setState({showCroppingArea: true, last_img_path:""});
        component.instance().forceUpdate();
        component = component.update();
        expect(component).toMatchSnapshot();
        expect(component.find(CroppingArea)).toHaveLength(1);
    })
});