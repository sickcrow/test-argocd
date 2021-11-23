import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom'
import HojaRuta from './hojaruta'
import Novedades from './novedades'
import ListarReclamos from './listarreclamos';
import { createBrowserHistory } from 'history'
import PermisosApp from '../components/permisos.json'


export default class Suscripciones extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        links: [],
        HojaDeRuta: [],
        accordion: false,
      }
    }

    history = createBrowserHistory()
    
    setLinks = this.props.setLinks

    allowedLinks = (arrLinks) => {
      const Links = localStorage.infoToken && JSON.parse(localStorage.infoToken)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      const allowedLinks = arrLinks.map((e, index, self) => {
        const { path } = e.props

        if (path.toLowerCase().includes("suscripciones")) {
          const initSlice = path.indexOf('/', path.indexOf('/') + 1)
          const stringlink = path.slice(initSlice + 1, undefined)
          
          const permisosUser =  Links.filter(e => e.includes(stringlink))

          if(permisosUser.length > 0) {
            return e
          }
        } else {
          return e
        }
      })
      return allowedLinks
    }

    componentDidMount() {
      document.title = "Suscripciones"
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }

    render(){
      const { postSuscripciones } = this.props

      return ( 
        <React.Fragment>
          <Router history={ this.props.props.history } >
            <Switch>
              <Route exact path="/Suscripciones" render={ () => {
                const Links = JSON.parse(localStorage.infoToken)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                const LinksApp = Links.filter(e => PermisosApp.includes(e))
                const primerlink = LinksApp.filter(e => e.toLowerCase().indexOf("hojaderuta") !== -1)[0] || LinksApp.filter(e => e.toLowerCase().indexOf("novedades") !== -1)[0] || LinksApp.filter(e => e.toLowerCase().indexOf("reclamos") !== -1)[0]
                if(primerlink && primerlink.toLowerCase().indexOf("hojaderuta") !== -1) {
                  return <HojaRuta postSuscripciones={postSuscripciones} hideMenu={this.props.hideMenu} />
                } else if (primerlink && primerlink.toLowerCase().indexOf("novedades") !== -1) {
                  return <Novedades postSuscripciones={postSuscripciones} hideMenu={this.props.hideMenu} />
                } else if (primerlink && primerlink.toLowerCase().indexOf("reclamos") !== -1) {
                  return <ListarReclamos postSuscripciones="{postSuscripciones}" hideMenu={this.props.hideMenu} />
                } else {
                  return <div>nada</div>
                }
              } }/>
              {this.allowedLinks([
                <Route key={0} exact path="/Suscripciones/HojaDeRuta" render={ () => <HojaRuta postSuscripciones={postSuscripciones} hideMenu={this.props.hideMenu} /> }/>,
                <Route key={1} exact path="/Suscripciones/Novedades" render={ () => <Novedades postSuscripciones={postSuscripciones} hideMenu={this.props.hideMenu} /> }/>,
                <Route key={2} exact path="/Suscripciones/Reclamos" render={ () => <ListarReclamos postSuscripciones={postSuscripciones} hideMenu={this.props.hideMenu} /> }/>
              ])}
            </Switch>
          </Router>
        </React.Fragment>
        )
    }
}