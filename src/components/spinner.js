import React, { Component } from 'react';
import './spinner.css';

export default class Spinner extends Component {
    
    render() {
        const { style } = this.props
        return (
            <div style={style} className="loader">Loading...</div>
        );
    }
}