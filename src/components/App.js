import * as React from 'react';
import './App.scss';
import Login from './login';
import { createBrowserHistory } from 'history'
import ResetPassword from './ResetPassword'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Register from './Register';
import AppContext from "./../context/AppContext";
import Landing from './landing'
import ReactGA from 'react-ga';

export default class App extends React.Component {
    constructor(props){
        super(props); 
        this.state={
          hiddenMenu: true,
          links: [],
          path: '',
          loginPage:[],
          landing:[],
          passwordChange:[],
          username:'',
          password:'',
          buttonLabel:'Regístrate',
          isLogin:true, 
          linkRegistrarse: this.linkRegistrarse
        }
    }

    history = createBrowserHistory()

      // MOSTRAR/OCULTAR MENU LATERAL
  hideMenu = (hide = "alt") => {
    //RECIBE 'alt' PARA ALTERNAR, TRUE PARA OCULTAR, FALSE PARA MOSTRAR
    if (hide === "alt") {
      const menu = document.getElementById("menu");
      if (menu) {
        menu.style.left = "";
      }
      this.setState({
        hiddenMenu: !this.state.hiddenMenu,
      });
    } else if (hide) {
      this.setState({
        hiddenMenu: true,
      });
    } else if (!hide) {
      this.setState({
        hiddenMenu: false,
      });
    }
    return;
  };

    setPasswordChange = (passwordChange) => {
      this.setState({
        passwordChange
      }, () => this.setState({
          landing: <Landing
          loggingOut={this.loggingOut}
          setLanding={this.setLanding}
        />
      }, () => this.setState({
        loginPage:[]
      })))
    }
    //UNA VEZ LOGEADO, SETEA LO QUE SE RECIBE COMO "LANDING PAGE"
    setLanding = (landing) => {
        this.setState({
            landing
        })
    }

    //SETEA LOS LINKS PARA EL MENU LATERAL
    setLinks = (links) => {
        this.setState({
            links
        })
    }

    //SETEA PÁGINA DE LOGIN, O LA ELIMINA EN CASO DE LOGIN EXITOSO
    setLogin = (login) => {
        this.setState({
            loginPage: login
        })
    }

    linkRegistrarse = (m) => {
        return <div onClick={(event) => this.handleClick(event)} style={{marginTop: 40,marginBottom: 5,cursor:"pointer"}}>
            {m}
        </div>
    }

    //REGRESA LA PÁGINA DE LOGIN PARA HACER EL LOGOUT
    loggingOut = () => {
      this.setLogin(
        <Login 
          parentContext={this}
          linkRegistrarse={this.state.linkRegistrarse}
          setLogin={this.setLogin}
          setLanding={this.setLanding}
          loggingOut={this.loggingOut} 
        />
      )
    }

    //CAMBIA ENTRE INICIO DE SESIÓN Y REGISTRO
    handleClick(event){
        if(this.state.isLogin){
            let loginPage=[];
            loginPage.push(<Register key="5" parentContext={this} linkRegistrarse={this.state.linkRegistrarse} setLogin={this.setLogin} setLanding={this.setLanding} loggingOut={this.loggingOut}/>);
            this.setState({
                loginPage:loginPage,
                buttonLabel:"Login", 
                isLogin:false
            })
        }
        else{
            let loginPage=[];
            loginPage.push(<Login key="2" parentContext={this} linkRegistrarse={this.state.linkRegistrarse} setLogin={this.setLogin} setLanding={this.setLanding} loggingOut={this.loggingOut}/>);
            this.setState({
                loginPage:loginPage ,
                buttonLabel:"Regístrate",
                isLogin:true
            })
        }
    }

    componentDidMount() {
      const { hostname } = window.location;
      switch (hostname) {
        case "paradaonline.com.ar":
            ReactGA.initialize('UA-92216516-7');
            break;  
        case "pp-kioscos.agea.com.ar":
            ReactGA.initialize('UA-92216516-6');
            break;
        default:
            ReactGA.initialize('UA-92216516-5');
        break;
      }

    }

    componentWillMount(){
        this.setLogin(<Login parentContext={this} 
          linkRegistrarse={this.state.linkRegistrarse} 
          setLogin={this.setLogin} 
          setLanding={this.setLanding} 
          loggingOut={this.loggingOut} 
          setPasswordChange={this.setPasswordChange} />);
        this.history.listen((location) => {
            this.setState({
                path: window.location.pathname
            })
        })
    }
    
    render() {
        return (
          <AppContext.Provider
            value={{
              setLogin: this.setLogin,
              setLanding: this.setLanding,
              setPasswordChange: this.setPasswordChange,
              loggingOut: this.loggingOut,
              urlConParametros: window.location.href,
              parentContext: this,
            }}>
            <div className="App">
              <Router >
                <Switch>
                  <Route
                    exact
                    path="/ResetPassword/:guidResetPassword"
                    render={() => <ResetPassword />}
                  />
                  <Route
                    exact
                    path="/ResetPassword"
                    render={() => <ResetPassword />}
                  />
                  <Route path="/" render={() => 
                    <div className="App-header"> 
                      
                      {/* SI HAY LOGIN MUESTRA EL LOGIN */}
                      { this.state.loginPage ?  this.state.loginPage : null }

                      {
                        this.state.loginPage.length === 0 && this.state.passwordChange ? this.state.passwordChange : null 
                      }
                      
                      { this.state.loginPage.length === 0 && this.state.passwordChange.length === 0 ? this.state.landing : null}
                      
                      
                    </div>} 
                  />
                </Switch>
              </Router>
            </div>
          </AppContext.Provider>
        );
    }
}