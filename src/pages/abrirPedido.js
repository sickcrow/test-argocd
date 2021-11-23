import * as React from 'react';
import { ReactSVG } from 'react-svg';
import eliminar from '../assets/eliminar.svg'

export default class AbrirReclamo extends React.Component {

    render() {
      return    <ReactSVG style={{width: '25px', height: '25px'}} src={eliminar}/>
    }
}