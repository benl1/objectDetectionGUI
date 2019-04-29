// output_screen.test.js
import React from 'react';
import { shallow, mount } from 'enzyme';
import OutputScreen from '../src/output_screen/output_screen';
import { OutputScreenContainer } from '../src/output_screen/output_screen';
import renderer from 'react-test-renderer';
import App from '../src/control/app';

describe('Output screens', () => {

    it('test that outputscreen renders correctly', ()=>{
        let component = shallow(<OutputScreen app={new App()}/>);
        expect(component.find(OutputScreenContainer)).toHaveLength(1);
        expect(component.find('.button')).toHaveLength(2);
        expect(component).toMatchSnapshot();
    })

    it('test that outputscreencontainer renders correctly', ()=>{
        let component = mount(<OutputScreenContainer app={new App()}/>)
        expect(component.find('.videoOutput')).toHaveLength(1);
        expect(component).toMatchSnapshot();
    })

});