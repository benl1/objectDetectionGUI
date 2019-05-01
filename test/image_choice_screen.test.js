// image_choice_screen.test.js
import React from 'react';
import { shallow, mount } from 'enzyme';
import ImageChoiceScreen from '../src/image_choice_screen/image_choice_screen';
import { ImageContainer, CroppingArea } from '../src/image_choice_screen/image_choice_screen';
import renderer from 'react-test-renderer';
import App from '../src/control/app';

describe('Image Choice screen', () => {
    it('test that image choice renders correctly', ()=>{
        const component = renderer.create(
            <ImageChoiceScreen app={new App()} />,
            document.getElementById('root')
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('test that imagecontainer renders correctly', ()=>{
        const component = renderer.create(
            <ImageContainer app={new App()} />,
            document.getElementById('root')
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('tests that cropping area renders correctly', ()=>{
        const component = renderer.create(
            <CroppingArea app={new App()} />,
            document.getElementById('root')
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('test that image choice renders cropping area when the state is changed', ()=>{        
        let component = shallow( <ImageContainer app={new App()} />);
        expect(component.find(CroppingArea)).toHaveLength(0);        
        component.instance().setState({show_cropping_area: true, last_img_path:""});
        component.instance().forceUpdate();
        component = component.update();
        expect(component.find(CroppingArea)).toHaveLength(1);
    })

    it('test image upload and clear functionality', ()=>{
        // using mount so we can access the props
        const path = "<rootDir>/assets/robot.jpg"
        let parent = mount(<ImageContainer app={new App()} />);
        let component = mount(<CroppingArea parent = {parent.instance()} img_path = {path}/>)
        expect(component.prop('img_path')).toEqual(path)
        component.instance().handleWholeImage();
        component.instance().forceUpdate();
        component = component.update();
        // check that the parent pushed an image after handleWholeImage
        expect(parent.prop('app').images).toHaveLength(1);
        parent.instance().clearImage(path)
        expect(parent.prop('app').images).toHaveLength(0);
    })
});