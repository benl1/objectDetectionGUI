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
        component.instance().setState({showCroppingArea: true, last_img_path:""});
        component.instance().forceUpdate();
        component = component.update();
        expect(component.find(CroppingArea)).toHaveLength(1);
    })

    it('test cropping area functionality', ()=>{
        // using mount so we can access the props
        let parent = mount(<ImageContainer app={new App()} />);
        let component = mount(<CroppingArea death = {parent.instance()} img_path = {"<rootDir>/assets/robot.jpg"}/>)
        expect(component.prop('img_path')).toEqual("<rootDir>/assets/robot.jpg")
        component.instance().handleWholeImage();

        component.instance().forceUpdate();
        component = component.update();
        console.log(parent.prop('app'))
        expect(parent.prop('app').images).toHaveLength(1);
    })
});