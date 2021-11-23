import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';

class Loginscreen extends Component {
    constructor(props){
        super(props);
        this.state={
            username:'',
            password:'',
            loginscreen:[],
            loginmessage:'',
            buttonLabel:'Regístrate',
            isLogin:true
        }
    }

    //CAMBIA ENTRE INICIO DE SESIÓN Y REGISTRO
    handleClick(event){
        let loginmessage;
        if(this.state.isLogin){
            let loginscreen=[];
            loginscreen.push(<Register key="5" parentContext={this}/>);
            loginmessage = "¿Ya estás registrado? Inicia sesión";
            this.setState({
                loginscreen:loginscreen,
                loginmessage:loginmessage,
                buttonLabel:"Login",
                isLogin:false
            })
        }
        else{
            let loginscreen=[];
            loginscreen.push(<Login key="2" parentContext={this}/>);
            loginmessage = "¿No estás registrado? Regístrate.";
            this.setState({
                loginscreen:loginscreen,
                loginmessage:loginmessage,
                buttonLabel:"Regístrate",
                isLogin:true
            })
        }
    }

    componentWillMount(){
        let loginscreen=[];
        loginscreen.push(<Login key="3" parentContext={this} appContext={this.props.parentContext}/>);
        const loginmessage = "¿No estás registrado? Regístrate.";
        this.setState({
            loginscreen:loginscreen,
            loginmessage:loginmessage
        })
    }

    render() {
        return (
            <div className="loginscreen">
                {this.state.loginscreen}
                <div onClick={(event) => this.handleClick(event)}>
                    {this.state.loginmessage}
                </div>
            </div>
        );
    }
}

export default Loginscreen;