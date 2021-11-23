import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom'
import PermisosApp from '../components/permisos.json'
import Publicaciones from './publicaciones'
import MisPedidos from './mispedidos'
import CargarPedido from '../pages/cargarPedido'
import EditarPedido from '../pages/editarPedido'
import { createBrowserHistory } from 'history'

export default class Pedidos extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        links: [],
        accordion: false,
        urlRedirect:""
      }
    }

    history = createBrowserHistory()
    
    setLinks = this.props.setLinks

    componentDidMount() 
    {
      document.title = "Publicaciones"

      this.setState({
        urlRedirect: "/Pedidos"
      })
    }

    allowedLinks = (arrLinks) => {
      const Links = JSON.parse(localStorage.infoToken)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      const allowedLinks = arrLinks.map((e, index, self) => {
        const { path } = e.props
        if (path.toLowerCase().includes("pedidos")) {
          const initSlice = path.indexOf('/', path.indexOf('/') + 1)
          const stringlink = path.slice(initSlice + 1, undefined)
          const permisosUser = Links.filter(e => e.includes(stringlink))
          if(permisosUser.length > 0) {
            return e
          }
        } else {
          return e
        }
      })
      return allowedLinks
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }

    render(){
      const {urlRedirect} = this.state;
      return (
        <React.Fragment>
        <Router history={ this.props.props.history } > 
            <Switch>
              <Route exact path={urlRedirect} render={ (props) => {
                const Links = JSON.parse(localStorage.infoToken)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                const LinksApp = Links.filter(e => PermisosApp.includes(e))
                const primerlink = LinksApp.filter(e => e.toLowerCase().indexOf("publicaciones") !== -1)[0] || LinksApp.filter(e => e.toLowerCase().indexOf("mispedidos") !== -1)[0] 
                if(primerlink && primerlink.toLowerCase().indexOf("publicaciones") !== -1) {
                  return <Publicaciones hideMenu={this.props.hideMenu} props={props} />
                } else if (primerlink && primerlink.toLowerCase().indexOf("mispedidos") !== -1) {
                  return <MisPedidos hideMenu={this.props.hideMenu} props={props}  />
                } else {
                  return <div></div>
                }
                
              } }/>
              {this.allowedLinks([
                <Route key={0} exact path={urlRedirect+"/Publicaciones"} render={ (props) => <Publicaciones props={props} hideMenu={this.props.hideMenu} /> }/>,
                <Route key={1} exact path={urlRedirect+"/MisPedidos"} render={ (props) => <MisPedidos props={props} hideMenu={this.props.hideMenu} /> }/>,
                <Route key={2} exact path={urlRedirect+"/CargarPedido"} render={ (props) => <CargarPedido props={props} hideMenu={this.props.hideMenu}/>} />,
                <Route key={3} exact path={urlRedirect+"/EditarPedido"} render={ (props) => <EditarPedido props={props} />} />,
               ])}
            </Switch>
          </Router>
        </React.Fragment>
        )
    }
} 